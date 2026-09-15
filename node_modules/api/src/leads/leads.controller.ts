import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { LeadsService } from './leads.service.js';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Captura un lead desde un CTA del sitio ("Certifícate gratis", etc.)' })
  create(@Body() dto: CreateLeadDto) {
    const lead = this.leadsService.create(dto);
    return { id: lead.id, createdAt: lead.createdAt };
  }
}
