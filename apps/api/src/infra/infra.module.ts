import { Module } from '@nestjs/common';
import { InfraService } from './infra.service';
import { InfraController } from './infra.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InfraController],
  providers: [InfraService],
  exports: [InfraService],
})
export class InfraModule {}
