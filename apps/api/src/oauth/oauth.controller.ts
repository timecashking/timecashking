import { Controller, Get, Post, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OauthService } from './oauth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('OAuth')
@Controller('oauth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @Get('google')
  @ApiOperation({ summary: 'Obter URL de autorização Google' })
  @ApiResponse({ status: 200, description: 'URL de autorização obtida' })
  async getGoogleOAuthUrl() {
    return this.oauthService.getGoogleOAuthUrl();
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Callback do Google OAuth' })
  @ApiResponse({ status: 200, description: 'OAuth processado com sucesso' })
  async googleOAuthCallback(@Query('code') code: string, @Query('state') state: string) {
    // O state deve conter o userId (implementar validação de segurança)
    const userId = state || 'default-user-id';
    return this.oauthService.googleOAuthCallback(code, userId);
  }

  @Post('google/refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renovar token Google' })
  @ApiResponse({ status: 200, description: 'Token renovado com sucesso' })
  async refreshGoogleToken(@Request() req) {
    return this.oauthService.refreshGoogleToken(req.user.userId);
  }

  @Post('google/revoke')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revogar acesso Google' })
  @ApiResponse({ status: 200, description: 'Acesso revogado com sucesso' })
  async revokeGoogleAccess(@Request() req) {
    return this.oauthService.revokeGoogleAccess(req.user.userId);
  }

  @Get('google/calendar/events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter eventos do Google Calendar' })
  @ApiResponse({ status: 200, description: 'Eventos obtidos com sucesso' })
  async getGoogleCalendarEvents(@Query('maxResults') maxResults: number, @Request() req) {
    return this.oauthService.getGoogleCalendarEvents(req.user.userId, maxResults);
  }
}
