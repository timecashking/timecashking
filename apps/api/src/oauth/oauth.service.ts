import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OauthService {
  constructor(private readonly prisma: PrismaService) {}

  async getGoogleOAuthUrl() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const scope = 'https://www.googleapis.com/auth/calendar';

    if (!clientId || !redirectUri) {
      throw new BadRequestException('Configuração do Google OAuth não encontrada');
    }

    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;

    return { url: authUrl };
  }

  async googleOAuthCallback(code: string, userId: string) {
    try {
      // Placeholder de troca de código por tokens
      const oauthData = await this.prisma.googleOAuth.upsert({
        where: { userId },
        update: {
          accessToken: 'access-token-placeholder',
          refreshToken: 'refresh-token-placeholder',
        },
        create: {
          userId,
          accessToken: 'access-token-placeholder',
          refreshToken: 'refresh-token-placeholder',
        },
      });

      return {
        message: 'OAuth realizado com sucesso',
        userId,
      };
    } catch (error) {
      throw new BadRequestException('Erro ao processar OAuth: ' + error.message);
    }
  }

  async refreshGoogleToken(userId: string) {
    const oauthData = await this.prisma.googleOAuth.findUnique({
      where: { userId },
    });

    if (!oauthData) {
      throw new BadRequestException('Usuário não possui OAuth configurado');
    }

    const updatedOauth = await this.prisma.googleOAuth.update({
      where: { userId },
      data: {
        accessToken: 'new-access-token-placeholder',
      },
    });

    return {
      message: 'Token renovado com sucesso',
      accessToken: updatedOauth.accessToken,
    };
  }

  async revokeGoogleAccess(userId: string) {
    const oauthData = await this.prisma.googleOAuth.findUnique({
      where: { userId },
    });

    if (!oauthData) {
      throw new BadRequestException('Usuário não possui OAuth configurado');
    }

    await this.prisma.googleOAuth.delete({
      where: { userId },
    });

    return { message: 'Acesso Google revogado com sucesso' };
  }

  async getGoogleCalendarEvents(userId: string, maxResults: number = 10) {
    const oauthData = await this.prisma.googleOAuth.findUnique({
      where: { userId },
    });

    if (!oauthData) {
      throw new BadRequestException('Usuário não possui OAuth configurado');
    }

    // Placeholder de eventos
    return {
      message: 'Eventos do Google Calendar obtidos com sucesso',
      events: [
        {
          id: 'event-1',
          summary: 'Reunião de Exemplo',
          start: new Date().toISOString(),
          end: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
      ],
    };
  }
}
