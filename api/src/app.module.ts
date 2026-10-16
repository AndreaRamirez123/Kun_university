import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProgramsModule } from './programs/programs.module.js';
import { LeadsModule } from './leads/leads.module.js';
import { KrucnModule } from './krucn/krucn.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ProgramsModule, LeadsModule, KrucnModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
