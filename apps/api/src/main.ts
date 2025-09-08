import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Configuração de CORS
  app.enableCors({
    origin: [
      process.env.WEB_ORIGIN || 'http://localhost:3001',
    ],
    credentials: true,
  });

  // Configuração de validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('TimeCash King API')
    .setDescription('API completa para o sistema TimeCash King')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Legacy - APIs Existentes', 'APIs legadas para compatibilidade')
    .addTag('Auth', 'Autenticação e autorização')
    .addTag('Users', 'Gerenciamento de usuários')
    .addTag('Categories', 'Gerenciamento de categorias')
    .addTag('Products', 'Gerenciamento de produtos e estoque')
    .addTag('Entries', 'Gerenciamento financeiro (entradas/saídas)')
    .addTag('Accounts', 'Gerenciamento de contas bancárias')
    .addTag('Sales', 'Gerenciamento de vendas')
    .addTag('Meetings', 'Gerenciamento de reuniões e agenda')
    .addTag('OAuth', 'Integração com Google OAuth')
    .addTag('NLP', 'Processamento de linguagem natural')
    .addTag('Infrastructure', 'Monitoramento e infraestrutura')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Prefixo global para API
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 TimeCash King API rodando na porta ${port}`);
  console.log(`📚 Swagger disponível em: http://localhost:${port}/api`);
}

bootstrap();
