import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMeetingDto: any, userId: string) {
    const { startTime, endTime } = createMeetingDto;

    // Verificar se a data de início é anterior à data de fim
    if (new Date(startTime) >= new Date(endTime)) {
      throw new BadRequestException('Data de início deve ser anterior à data de fim');
    }

    // Verificar se há conflito de horário
    const conflictingMeeting = await this.prisma.meeting.findFirst({
      where: {
        userId,
        OR: [
          {
            startTime: {
              lt: new Date(endTime),
              gte: new Date(startTime),
            },
          },
          {
            endTime: {
              gt: new Date(startTime),
              lte: new Date(endTime),
            },
          },
        ],
      },
    });

    if (conflictingMeeting) {
      throw new BadRequestException('Já existe uma reunião neste horário');
    }

    const meeting = await this.prisma.meeting.create({
      data: {
        ...createMeetingDto,
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return meeting;
  }

  async findAll(userId: string, filters: any = {}) {
    const { page = 1, limit = 10, startDate, endDate, location } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const [meetings, total] = await Promise.all([
      this.prisma.meeting.findMany({
        where,
        orderBy: { startTime: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.meeting.count({ where }),
    ]);

    return {
      data: meetings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!meeting) {
      throw new NotFoundException('Reunião não encontrada');
    }

    return meeting;
  }

  async update(id: string, updateMeetingDto: any, userId: string) {
    // Verificar se a reunião pertence ao usuário
    await this.findOne(id, userId);

    const { startTime, endTime } = updateMeetingDto;

    if (startTime && endTime) {
      // Verificar se a data de início é anterior à data de fim
      if (new Date(startTime) >= new Date(endTime)) {
        throw new BadRequestException('Data de início deve ser anterior à data de fim');
      }

      // Verificar se há conflito de horário (excluindo a reunião atual)
      const conflictingMeeting = await this.prisma.meeting.findFirst({
        where: {
          userId,
          NOT: { id },
          OR: [
            {
              startTime: {
                lt: new Date(endTime),
                gte: new Date(startTime),
              },
            },
            {
              endTime: {
                gt: new Date(startTime),
                lte: new Date(endTime),
              },
            },
          ],
        },
      });

      if (conflictingMeeting) {
        throw new BadRequestException('Já existe uma reunião neste horário');
      }
    }

    const meeting = await this.prisma.meeting.update({
      where: { id },
      data: {
        ...updateMeetingDto,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
      },
    });

    return meeting;
  }

  async remove(id: string, userId: string) {
    // Verificar se a reunião pertence ao usuário
    await this.findOne(id, userId);

    await this.prisma.meeting.delete({
      where: { id },
    });

    return { message: 'Reunião removida com sucesso' };
  }

  async syncWithGoogle(meetingId: string, userId: string) {
    // Verificar se a reunião pertence ao usuário
    const meeting = await this.findOne(meetingId, userId);

    // Aqui você implementaria a lógica de sincronização com Google Calendar
    // Por enquanto, retornamos uma mensagem de placeholder
    return {
      message: 'Sincronização com Google Calendar implementada',
      meetingId,
      googleEventId: meeting.googleEventId || 'novo-evento-id',
    };
  }

  async getUpcomingMeetings(userId: string, limit: number = 5) {
    const currentDate = new Date();

    const meetings = await this.prisma.meeting.findMany({
      where: {
        userId,
        startTime: {
          gte: currentDate,
        },
      },
      orderBy: { startTime: 'asc' },
      take: limit,
    });

    return meetings;
  }
}
