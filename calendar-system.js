import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();

// ===== SISTEMA DE AGENDA E GOOGLE CALENDAR =====

export class CalendarSystem {
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // ===== AUTENTICAÇÃO GOOGLE =====

  // Gerar URL de autorização
  generateAuthUrl(companyId) {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const state = Buffer.from(JSON.stringify({ companyId })).toString('base64');

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: state,
      prompt: 'consent'
    });
  }

  // Processar callback de autorização
  async handleAuthCallback(code, state) {
    try {
      const { companyId } = JSON.parse(Buffer.from(state, 'base64').toString());
      
      const { tokens } = await this.oauth2Client.getToken(code);
      
      // Salvar tokens na empresa
      await prisma.company.update({
        where: { id: companyId },
        data: {
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleCalendarId: 'primary' // Usar calendário principal por padrão
        }
      });

      return {
        success: true,
        message: 'Calendário Google conectado com sucesso!'
      };

    } catch (error) {
      console.error('Erro ao processar callback de autorização:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Renovar token de acesso
  async refreshAccessToken(companyId) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { googleRefreshToken: true }
      });

      if (!company?.googleRefreshToken) {
        throw new Error('Token de renovação não encontrado');
      }

      this.oauth2Client.setCredentials({
        refresh_token: company.googleRefreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      // Atualizar token na empresa
      await prisma.company.update({
        where: { id: companyId },
        data: {
          googleAccessToken: credentials.access_token
        }
      });

      return credentials.access_token;

    } catch (error) {
      console.error('Erro ao renovar token:', error);
      throw error;
    }
  }

  // ===== GESTÃO DE EVENTOS =====

  // Criar evento
  async createEvent(data) {
    const {
      companyId,
      userId,
      title,
      description,
      startDate,
      endDate,
      contact,
      location,
      type = 'MEETING'
    } = data;

    try {
      // Validar datas
      if (new Date(startDate) >= new Date(endDate)) {
        throw new Error('Data de início deve ser anterior à data de fim');
      }

      // Criar evento no banco
      const event = await prisma.event.create({
        data: {
          companyId,
          userId,
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          contact,
          location,
          type
        }
      });

      // Tentar criar no Google Calendar
      try {
        await this.createGoogleCalendarEvent(event, companyId);
      } catch (error) {
        console.log('Erro ao criar no Google Calendar:', error);
        // Continuar mesmo se falhar no Google
      }

      return {
        success: true,
        event
      };

    } catch (error) {
      console.error('Erro ao criar evento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Atualizar evento
  async updateEvent(eventId, data, companyId) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });

      if (!event) {
        throw new Error('Evento não encontrado');
      }

      if (event.companyId !== companyId) {
        throw new Error('Acesso negado');
      }

      // Validar datas se fornecidas
      if (data.startDate && data.endDate) {
        if (new Date(data.startDate) >= new Date(data.endDate)) {
          throw new Error('Data de início deve ser anterior à data de fim');
        }
      }

      // Atualizar evento
      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined
        }
      });

      // Atualizar no Google Calendar se existir
      if (event.googleEventId) {
        try {
          await this.updateGoogleCalendarEvent(updatedEvent, companyId);
        } catch (error) {
          console.log('Erro ao atualizar no Google Calendar:', error);
        }
      }

      return {
        success: true,
        event: updatedEvent
      };

    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Excluir evento
  async deleteEvent(eventId, companyId) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });

      if (!event) {
        throw new Error('Evento não encontrado');
      }

      if (event.companyId !== companyId) {
        throw new Error('Acesso negado');
      }

      // Excluir do Google Calendar se existir
      if (event.googleEventId) {
        try {
          await this.deleteGoogleCalendarEvent(event.googleEventId, companyId);
        } catch (error) {
          console.log('Erro ao excluir do Google Calendar:', error);
        }
      }

      // Excluir do banco
      await prisma.event.delete({
        where: { id: eventId }
      });

      return {
        success: true,
        message: 'Evento excluído com sucesso!'
      };

    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Buscar eventos
  async getEvents(companyId, filters = {}) {
    try {
      const {
        startDate,
        endDate,
        type,
        search,
        page = 1,
        limit = 20
      } = filters;

      const where = { companyId };

      if (startDate || endDate) {
        where.startDate = {};
        if (startDate) where.startDate.gte = new Date(startDate);
        if (endDate) where.startDate.lte = new Date(endDate);
      }

      if (type) where.type = type;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { contact: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          include: {
            user: {
              select: { name: true, email: true }
            }
          },
          orderBy: { startDate: 'asc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.event.count({ where })
      ]);

      return {
        success: true,
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Buscar eventos próximos
  async getUpcomingEvents(companyId, days = 7) {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const events = await prisma.event.findMany({
        where: {
          companyId,
          startDate: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { startDate: 'asc' }
      });

      return {
        success: true,
        events
      };

    } catch (error) {
      console.error('Erro ao buscar eventos próximos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Buscar eventos de hoje
  async getTodayEvents(companyId) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const events = await prisma.event.findMany({
        where: {
          companyId,
          startDate: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { startDate: 'asc' }
      });

      return {
        success: true,
        events
      };

    } catch (error) {
      console.error('Erro ao buscar eventos de hoje:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== INTEGRAÇÃO GOOGLE CALENDAR =====

  // Criar evento no Google Calendar
  async createGoogleCalendarEvent(event, companyId) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { googleAccessToken: true, googleCalendarId: true }
      });

      if (!company?.googleAccessToken) {
        throw new Error('Google Calendar não configurado');
      }

      // Configurar cliente OAuth2
      this.oauth2Client.setCredentials({
        access_token: company.googleAccessToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Preparar evento para Google Calendar
      const googleEvent = {
        summary: event.title,
        description: event.description || '',
        location: event.location || '',
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: process.env.APP_TZ || 'America/Sao_Paulo'
        },
        end: {
          dateTime: event.endDate.toISOString(),
          timeZone: process.env.APP_TZ || 'America/Sao_Paulo'
        },
        attendees: event.contact ? [{ email: event.contact }] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 15 },
            { method: 'email', minutes: 60 }
          ]
        }
      };

      // Criar evento no Google Calendar
      const response = await calendar.events.insert({
        calendarId: company.googleCalendarId || 'primary',
        resource: googleEvent
      });

      // Atualizar evento com ID do Google
      await prisma.event.update({
        where: { id: event.id },
        data: { googleEventId: response.data.id }
      });

      return response.data;

    } catch (error) {
      console.error('Erro ao criar evento no Google Calendar:', error);
      
      // Se for erro de token expirado, tentar renovar
      if (error.code === 401) {
        try {
          const newToken = await this.refreshAccessToken(companyId);
          // Tentar novamente com novo token
          return await this.createGoogleCalendarEvent(event, companyId);
        } catch (refreshError) {
          console.error('Erro ao renovar token:', refreshError);
        }
      }
      
      throw error;
    }
  }

  // Atualizar evento no Google Calendar
  async updateGoogleCalendarEvent(event, companyId) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { googleAccessToken: true, googleCalendarId: true }
      });

      if (!company?.googleAccessToken || !event.googleEventId) {
        throw new Error('Google Calendar não configurado ou evento sem ID');
      }

      this.oauth2Client.setCredentials({
        access_token: company.googleAccessToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const googleEvent = {
        summary: event.title,
        description: event.description || '',
        location: event.location || '',
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: process.env.APP_TZ || 'America/Sao_Paulo'
        },
        end: {
          dateTime: event.endDate.toISOString(),
          timeZone: process.env.APP_TZ || 'America/Sao_Paulo'
        },
        attendees: event.contact ? [{ email: event.contact }] : []
      };

      const response = await calendar.events.update({
        calendarId: company.googleCalendarId || 'primary',
        eventId: event.googleEventId,
        resource: googleEvent
      });

      return response.data;

    } catch (error) {
      console.error('Erro ao atualizar evento no Google Calendar:', error);
      
      if (error.code === 401) {
        try {
          await this.refreshAccessToken(companyId);
          return await this.updateGoogleCalendarEvent(event, companyId);
        } catch (refreshError) {
          console.error('Erro ao renovar token:', refreshError);
        }
      }
      
      throw error;
    }
  }

  // Excluir evento do Google Calendar
  async deleteGoogleCalendarEvent(googleEventId, companyId) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { googleAccessToken: true, googleCalendarId: true }
      });

      if (!company?.googleAccessToken) {
        throw new Error('Google Calendar não configurado');
      }

      this.oauth2Client.setCredentials({
        access_token: company.googleAccessToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: company.googleCalendarId || 'primary',
        eventId: googleEventId
      });

      return true;

    } catch (error) {
      console.error('Erro ao excluir evento do Google Calendar:', error);
      
      if (error.code === 401) {
        try {
          await this.refreshAccessToken(companyId);
          return await this.deleteGoogleCalendarEvent(googleEventId, companyId);
        } catch (refreshError) {
          console.error('Erro ao renovar token:', refreshError);
        }
      }
      
      throw error;
    }
  }

  // Sincronizar eventos do Google Calendar
  async syncFromGoogleCalendar(companyId) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { googleAccessToken: true, googleCalendarId: true }
      });

      if (!company?.googleAccessToken) {
        throw new Error('Google Calendar não configurado');
      }

      this.oauth2Client.setCredentials({
        access_token: company.googleAccessToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Buscar eventos dos últimos 30 dias e próximos 90 dias
      const now = new Date();
      const timeMin = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const timeMax = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const response = await calendar.events.list({
        calendarId: company.googleCalendarId || 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      const googleEvents = response.data.items || [];
      let syncedCount = 0;
      let updatedCount = 0;

      for (const googleEvent of googleEvents) {
        // Pular eventos que não são do usuário (criados por outros)
        if (googleEvent.creator?.email && !googleEvent.creator.email.includes(companyId)) {
          continue;
        }

        const existingEvent = await prisma.event.findFirst({
          where: { googleEventId: googleEvent.id }
        });

        const eventData = {
          title: googleEvent.summary || 'Evento sem título',
          description: googleEvent.description || '',
          startDate: new Date(googleEvent.start.dateTime || googleEvent.start.date),
          endDate: new Date(googleEvent.end.dateTime || googleEvent.end.date),
          location: googleEvent.location || '',
          contact: googleEvent.attendees?.[0]?.email || '',
          type: 'MEETING'
        };

        if (existingEvent) {
          // Atualizar evento existente
          await prisma.event.update({
            where: { id: existingEvent.id },
            data: eventData
          });
          updatedCount++;
        } else {
          // Criar novo evento
          await prisma.event.create({
            data: {
              ...eventData,
              companyId,
              googleEventId: googleEvent.id
            }
          });
          syncedCount++;
        }
      }

      return {
        success: true,
        synced: syncedCount,
        updated: updatedCount,
        total: googleEvents.length
      };

    } catch (error) {
      console.error('Erro ao sincronizar do Google Calendar:', error);
      
      if (error.code === 401) {
        try {
          await this.refreshAccessToken(companyId);
          return await this.syncFromGoogleCalendar(companyId);
        } catch (refreshError) {
          console.error('Erro ao renovar token:', refreshError);
        }
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== FUNCIONALIDADES ADICIONAIS =====

  // Buscar disponibilidade
  async checkAvailability(companyId, startDate, endDate, excludeEventId = null) {
    try {
      const where = {
        companyId,
        OR: [
          {
            startDate: {
              lt: new Date(endDate),
              gte: new Date(startDate)
            }
          },
          {
            endDate: {
              gt: new Date(startDate),
              lte: new Date(endDate)
            }
          },
          {
            AND: [
              { startDate: { lte: new Date(startDate) } },
              { endDate: { gte: new Date(endDate) } }
            ]
          }
        ]
      };

      if (excludeEventId) {
        where.NOT = { id: excludeEventId };
      }

      const conflictingEvents = await prisma.event.findMany({
        where,
        select: { id: true, title: true, startDate: true, endDate: true }
      });

      return {
        success: true,
        available: conflictingEvents.length === 0,
        conflictingEvents
      };

    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gerar arquivo .ics (fallback)
  generateICSFile(event) {
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TimeCash King//Calendar//PT',
      'BEGIN:VEVENT',
      `UID:${event.id}@timecashking.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate)}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
      event.location ? `LOCATION:${event.location}` : '',
      event.contact ? `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${event.contact}` : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(line => line).join('\r\n');

    return icsContent;
  }

  // Configurar lembretes automáticos
  async setupEventReminders(companyId) {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Buscar eventos para amanhã
      const tomorrowEvents = await prisma.event.findMany({
        where: {
          companyId,
          startDate: {
            gte: tomorrow,
            lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        include: {
          user: {
            select: { telegramChatId: true }
          }
        }
      });

      // Enviar lembretes via Telegram se configurado
      for (const event of tomorrowEvents) {
        if (event.user?.telegramChatId) {
          // Aqui você pode integrar com o sistema de notificações
          console.log(`Lembrete: Evento "${event.title}" amanhã às ${event.startDate.toLocaleTimeString('pt-BR')}`);
        }
      }

      return {
        success: true,
        remindersSent: tomorrowEvents.length
      };

    } catch (error) {
      console.error('Erro ao configurar lembretes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Exportar a classe
export default CalendarSystem;
