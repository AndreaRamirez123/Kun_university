import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class KrucnTurnDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @ApiProperty({ example: '¿Qué materias tiene Cybersecurity?' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}

export class KrucnChatDto {
  @ApiProperty({ type: [KrucnTurnDto], description: 'Historial de la conversación; el último turno es del visitante.' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => KrucnTurnDto)
  messages!: KrucnTurnDto[];

  @ApiProperty({ enum: ['es', 'en'] })
  @IsIn(['es', 'en'])
  locale!: 'es' | 'en';

  @ApiPropertyOptional({ example: 'Ana' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  playerName?: string;

  @ApiPropertyOptional({ example: 'Escuela de Ingeniería, hacia el norte' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nearestPlace?: string;
}
