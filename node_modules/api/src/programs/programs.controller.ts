import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProgramsService } from './programs.service.js';

@ApiTags('programs')
@Controller()
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get('schools')
  @ApiOperation({ summary: 'Lista las 4 escuelas con sus programas académicos' })
  getSchools() {
    return this.programsService.getSchools();
  }

  @Get('schools/:slug')
  @ApiOperation({ summary: 'Detalle de una escuela por slug' })
  getSchool(@Param('slug') slug: string) {
    return this.programsService.getSchool(slug);
  }

  @Get('certifications')
  @ApiOperation({ summary: 'Lista las certificaciones de educación continua' })
  getCertifications() {
    return this.programsService.getCertifications();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas agregadas (escuelas, programas, certificaciones)' })
  getStats() {
    return this.programsService.getStats();
  }
}
