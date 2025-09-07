import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InfraService } from './infra.service';

@ApiTags('Infraestrutura')
@Controller('infra')
export class InfraController {
  constructor(private readonly infraService: InfraService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verificar saúde do sistema' })
  @ApiResponse({ status: 200, description: 'Sistema saudável' })
  @ApiResponse({ status: 503, description: 'Sistema com problemas' })
  async getHealth() {
    return this.infraService.getHealth();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Obter métricas do sistema' })
  @ApiResponse({ status: 200, description: 'Métricas obtidas com sucesso' })
  async getMetrics() {
    return this.infraService.getMetrics();
  }

  @Get('dashboard-forecast')
  @ApiOperation({ summary: 'Obter previsão do dashboard' })
  @ApiResponse({ status: 200, description: 'Previsão obtida com sucesso' })
  async getDashboardForecast() {
    return this.infraService.getDashboardForecast();
  }
}
