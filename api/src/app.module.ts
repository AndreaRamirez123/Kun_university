import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProgramsModule } from './programs/programs.module.js';
import { LeadsModule } from './leads/leads.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ProgramsModule, LeadsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
