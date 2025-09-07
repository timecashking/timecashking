import { Module } from '@nestjs/common';
import { LegacyController } from './legacy.controller';
import { LegacyService } from './legacy.service';

@Module({
  controllers: [LegacyController],
  providers: [LegacyService],
  exports: [LegacyService],
})
export class LegacyModule {}
