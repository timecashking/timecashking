import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { LegacyService } from './legacy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { CreateCardDto } from './dto/create-card.dto';
// import { CreateInvoiceDto } from './dto/create-invoice.dto'; // TEMPORARIAMENTE COMENTADO PARA DEPLOY
import { CreateMeetingDto } from './dto/create-meeting.dto';

@ApiTags('Legacy - APIs Existentes')
@Controller('legacy')
export class LegacyController {
  constructor(private readonly legacyService: LegacyService) {}

  // ========================================
  // AUTENTICAÇÃO E USUÁRIOS (LEGACY)
  // ========================================

  @Post('auth/register')
  @ApiOperation({ summary: 'Registro de usuário (Legacy)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiBody({ type: CreateProductDto })
  async register(@Body() createUserDto: any) {
    return this.legacyService.register(createUserDto);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Login de usuário (Legacy)' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  async login(@Body() loginDto: any) {
    return this.legacyService.login(loginDto);
  }

  @Post('auth/refresh')
  @ApiOperation({ summary: 'Refresh token (Legacy)' })
  @ApiResponse({ status: 200, description: 'Token renovado' })
  async refresh(@Body() refreshDto: any) {
    return this.legacyService.refresh(refreshDto);
  }

  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do usuário atual (Legacy)' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  async getMe(@Request() req: any) {
    return this.legacyService.getMe(req.user.id);
  }

  @Put('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar usuário (Legacy)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  async updateMe(@Request() req: any, @Body() updateUserDto: any) {
    return this.legacyService.updateMe(req.user.id, updateUserDto);
  }

  // ========================================
  // CATEGORIAS (LEGACY)
  // ========================================

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar categorias (Legacy)' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  async getCategories(@Request() req: any) {
    return this.legacyService.getCategories(req.user.id);
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar categoria (Legacy)' })
  @ApiResponse({ status: 201, description: 'Categoria criada' })
  @ApiBody({ type: CreateCategoryDto })
  async createCategory(@Request() req: any, @Body() createCategoryDto: CreateCategoryDto) {
    return this.legacyService.createCategory(req.user.id, createCategoryDto);
  }

  @Put('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar categoria (Legacy)' })
  @ApiParam({ name: 'id', description: 'ID da categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada' })
  async updateCategory(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateCategoryDto: any,
  ) {
    return this.legacyService.updateCategory(req.user.id, id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar categoria (Legacy)' })
  @ApiParam({ name: 'id', description: 'ID da categoria' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Request() req: any, @Param('id') id: string) {
    return this.legacyService.deleteCategory(req.user.id, id);
  }

  // ========================================
  // FINANCEIRO (LEGACY)
  // ========================================

  @Get('entries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar entradas/saídas (Legacy)' })
  @ApiQuery({ name: 'type', required: false, description: 'Tipo de entrada' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'ID da categoria' })
  @ApiResponse({ status: 200, description: 'Lista de entradas/saídas' })
  async getEntries(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.legacyService.getEntries(req.user.id, { type, categoryId });
  }

  @Post('entries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar entrada/saída (Legacy)' })
  @ApiResponse({ status: 201, description: 'Entrada/saída criada' })
  @ApiBody({ type: CreateEntryDto })
  async createEntry(@Request() req: any, @Body() createEntryDto: CreateEntryDto) {
    return this.legacyService.createEntry(req.user.id, createEntryDto);
  }

  @Put('entries/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar entrada/saída (Legacy)' })
  @ApiParam({ name: 'id', description: 'ID da entrada/saída' })
  @ApiResponse({ status: 200, description: 'Entrada/saída atualizada' })
  async updateEntry(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateEntryDto: any,
  ) {
    return this.legacyService.updateEntry(req.user.id, id, updateEntryDto);
  }

  @Delete('entries/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar entrada/saída (Legacy)' })
  @ApiParam({ name: 'id', description: 'ID da entrada/saída' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEntry(@Request() req: any, @Param('id') id: string) {
    return this.legacyService.deleteEntry(req.user.id, id);
  }

  @Get('summary/monthly')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resumo mensal (Legacy)' })
  @ApiQuery({ name: 'month', required: false, description: 'Mês (1-12)' })
  @ApiQuery({ name: 'year', required: false, description: 'Ano' })
  @ApiResponse({ status: 200, description: 'Resumo mensal' })
  async getMonthlySummary(
    @Request() req: any,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.legacyService.getMonthlySummary(req.user.id, month, year);
  }

  @Get('dashboard/forecast')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Previsões do dashboard (Legacy)' })
  @ApiResponse({ status: 200, description: 'Previsões' })
  async getDashboardForecast(@Request() req: any) {
    return this.legacyService.getDashboardForecast(req.user.id);
  }

  // ========================================
  // CARTÕES E FATURAS (LEGACY)
  // ========================================

  @Get('cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar cartões (Legacy)' })
  @ApiResponse({ status: 200, description: 'Lista de cartões' })
  async getCards(@Request() req: any) {
    return this.legacyService.getCards(req.user.id);
  }

  @Post('cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar cartão (Legacy)' })
  @ApiResponse({ status: 201, description: 'Cartão criado' })
  @ApiBody({ type: CreateCardDto })
  async createCard(@Request() req: any, @Body() createCardDto: CreateCardDto) {
    return this.legacyService.createCard(req.user.id, createCardDto);
  }

  @Get('cards/:id/invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Faturas do cartão (Legacy)' })
  @ApiParam({ name: 'id', description: 'ID do cartão' })
  @ApiResponse({ status: 200, description: 'Lista de faturas' })
  async getCardInvoices(@Request() req: any, @Param('id') cardId: string) {
    return this.legacyService.getCardInvoices(req.user.id, cardId);
  }

  @Post('cards/:cardId/charges')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar cobrança no cartão (Legacy)' })
  @ApiParam({ name: 'cardId', description: 'ID do cartão' })
  @ApiResponse({ status: 201, description: 'Cobrança criada' })
  async createCardCharge(
    @Request() req: any,
    @Param('cardId') cardId: string,
    @Body() createChargeDto: any,
  ) {
    return this.legacyService.createCardCharge(req.user.id, cardId, createChargeDto);
  }

  @Put('invoices/:id/pay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar fatura como paga (Legacy)' })
  @ApiParam({ name: 'id', description: 'ID da fatura' })
  @ApiResponse({ status: 200, description: 'Fatura marcada como paga' })
  async payInvoice(@Request() req: any, @Param('id') invoiceId: string) {
    return this.legacyService.payInvoice(req.user.id, invoiceId);
  }

  // ========================================
  // PRODUTOS E ESTOQUE (LEGACY)
  // ========================================

  @Get('products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar produtos (Legacy)' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'ID da categoria' })
  @ApiQuery({ name: 'status', required: false, description: 'Status do produto' })
  @ApiResponse({ status: 200, description: 'Lista de produtos' })
  async getProducts(
    @Request() req: any,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
  ) {
    return this.legacyService.getProducts(req.user.id, { categoryId, status });
  }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar produto (Legacy)' })
  @ApiResponse({ status: 201, description: 'Produto criado' })
  @ApiBody({ type: CreateProductDto })
  async createProduct(@Request() req: any, @Body() createProductDto: CreateProductDto) {
    return this.legacyService.createProduct(req.user.id, createProductDto);
  }

  @Put('products/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar produto (Legacy)' })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado' })
  async updateProduct(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateProductDto: any,
  ) {
    return this.legacyService.updateProduct(req.user.id, id, updateProductDto);
  }

  @Post('stock/moves')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Movimentação de estoque (Legacy)' })
  @ApiResponse({ status: 201, description: 'Movimentação criada' })
  async createStockMove(@Request() req: any, @Body() createStockMoveDto: any) {
    return this.legacyService.createStockMove(req.user.id, createStockMoveDto);
  }

  @Get('reports/profit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Relatório de lucro (Legacy)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data inicial' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data final' })
  @ApiResponse({ status: 200, description: 'Relatório de lucro' })
  async getProfitReport(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.legacyService.getProfitReport(req.user.id, startDate, endDate);
  }

  @Get('reports/reorder-alerts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alertas de reabastecimento (Legacy)' })
  @ApiResponse({ status: 200, description: 'Alertas de estoque baixo' })
  async getReorderAlerts(@Request() req: any) {
    return this.legacyService.getReorderAlerts(req.user.id);
  }

  // ========================================
  // VENDAS (LEGACY)
  // ========================================

  @Get('sales')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar vendas (Legacy)' })
  @ApiQuery({ name: 'status', required: false, description: 'Status da venda' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data inicial' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data final' })
  @ApiResponse({ status: 200, description: 'Lista de vendas' })
  async getSales(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.legacyService.getSales(req.user.id, { status, startDate, endDate });
  }

  @Post('sales')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar venda (Legacy)' })
  @ApiResponse({ status: 201, description: 'Venda criada' })
  async createSale(@Request() req: any, @Body() createSaleDto: any) {
    return this.legacyService.createSale(req.user.id, createSaleDto);
  }

  // ========================================
  // AGENDA E GOOGLE (LEGACY)
  // ========================================

  @Get('meetings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar reuniões (Legacy)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data inicial' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data final' })
  @ApiResponse({ status: 200, description: 'Lista de reuniões' })
  async getMeetings(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.legacyService.getMeetings(req.user.id, { startDate, endDate });
  }

  @Post('meetings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar reunião (Legacy)' })
  @ApiResponse({ status: 201, description: 'Reunião criada' })
  @ApiBody({ type: CreateMeetingDto })
  async createMeeting(@Request() req: any, @Body() createMeetingDto: CreateMeetingDto) {
    return this.legacyService.createMeeting(req.user.id, createMeetingDto);
  }

  @Put('meetings/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar reunião (Legacy)' })
  @ApiParam({ name: 'id', description: 'ID da reunião' })
  @ApiResponse({ status: 200, description: 'Reunião atualizada' })
  async updateMeeting(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateMeetingDto: any,
  ) {
    return this.legacyService.updateMeeting(req.user.id, id, updateMeetingDto);
  }

  @Delete('meetings/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar reunião (Legacy)' })
  @ApiParam({ name: 'id', description: 'ID da reunião' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMeeting(@Request() req: any, @Param('id') id: string) {
    return this.legacyService.deleteMeeting(req.user.id, id);
  }

  @Get('oauth/google')
  @ApiOperation({ summary: 'OAuth Google (Legacy)' })
  @ApiResponse({ status: 200, description: 'URL de autorização' })
  async getGoogleOAuthUrl() {
    return this.legacyService.getGoogleOAuthUrl();
  }

  @Get('oauth/google/callback')
  @ApiOperation({ summary: 'Callback OAuth Google (Legacy)' })
  @ApiQuery({ name: 'code', description: 'Código de autorização' })
  @ApiResponse({ status: 200, description: 'OAuth realizado com sucesso' })
  async googleOAuthCallback(@Query('code') code: string) {
    return this.legacyService.googleOAuthCallback(code);
  }

  @Post('google/sync/meeting/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sincronizar reunião com Google (Legacy)' })
  @ApiParam({ name: 'id', description: 'ID da reunião' })
  @ApiResponse({ status: 200, description: 'Reunião sincronizada' })
  async syncMeetingWithGoogle(@Request() req: any, @Param('id') meetingId: string) {
    return this.legacyService.syncMeetingWithGoogle(req.user.id, meetingId);
  }

  // ========================================
  // NLP (LEGACY)
  // ========================================

  @Post('nlp/parse')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Processar texto NLP (Legacy)' })
  @ApiResponse({ status: 200, description: 'Texto processado' })
  async parseNLP(@Request() req: any, @Body() parseDto: any) {
    return this.legacyService.parseNLP(req.user.id, parseDto);
  }

  // ========================================
  // INFRAESTRUTURA (LEGACY)
  // ========================================

  @Get('health')
  @ApiOperation({ summary: 'Health check (Legacy)' })
  @ApiResponse({ status: 200, description: 'Sistema saudável' })
  async health() {
    return this.legacyService.health();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Métricas do sistema (Legacy)' })
  @ApiResponse({ status: 200, description: 'Métricas' })
  async metrics() {
    return this.legacyService.metrics();
  }
}
