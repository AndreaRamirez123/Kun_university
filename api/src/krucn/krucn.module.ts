import { Module } from '@nestjs/common';
import { KrucnController } from './krucn.controller.js';
import { KrucnService } from './krucn.service.js';

@Module({
  controllers: [KrucnController],
  providers: [KrucnService],
})
export class KrucnModule {}
