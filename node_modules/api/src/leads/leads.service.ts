import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateLeadDto } from './dto/create-lead.dto.js';

export interface Lead extends CreateLeadDto {
  id: string;
  createdAt: string;
}

/**
 * In-memory store — placeholder until a real database (e.g. Postgres via
 * Prisma/TypeORM) is wired in. Data does not survive a server restart.
 */
@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);
  private readonly leads: Lead[] = [];

  create(dto: CreateLeadDto): Lead {
    const lead: Lead = {
      ...dto,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.leads.push(lead);
    this.logger.log(`Nuevo lead (${dto.source}): ${dto.email}`);
    return lead;
  }

  findAll(): Lead[] {
    return this.leads;
  }
}
