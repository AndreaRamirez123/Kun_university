import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export const LEAD_SOURCES = [
  'hero_cta',
  'continuing_ed_cta',
  'community_cta',
  'newsletter',
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export class CreateLeadDto {
  @ApiProperty({ example: 'ana.rivera@example.com' })
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  email!: string;

  @ApiPropertyOptional({ example: 'Ana Rivera' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiProperty({ enum: LEAD_SOURCES, example: 'hero_cta' })
  @IsIn(LEAD_SOURCES, { message: `source debe ser uno de: ${LEAD_SOURCES.join(', ')}` })
  source!: LeadSource;
}
