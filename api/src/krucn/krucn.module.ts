import { Module } from '@nestjs/common';
import { LeadsModule } from '../leads/leads.module.js';
import { KrucnController } from './krucn.controller.js';
import { KrucnService } from './krucn.service.js';

@Module({
  imports: [LeadsModule],
  controllers: [KrucnController],
  providers: [KrucnService],
})
export class KrucnModule {}
