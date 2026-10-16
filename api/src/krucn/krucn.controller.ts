import { APIUserAbortError } from '@anthropic-ai/sdk';
import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { KrucnChatDto } from './dto/krucn-chat.dto.js';
import { KrucnService } from './krucn.service.js';

// Límite sencillo por IP para que nadie dispare el gasto del modelo.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, number[]>();

function allow(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

@ApiTags('krucn')
@Controller('krucn')
export class KrucnController {
  constructor(private readonly krucn: KrucnService) {}

  @Get('status')
  @ApiOperation({ summary: 'Indica si el agente de Krucn está disponible' })
  status() {
    return { enabled: this.krucn.enabled };
  }

  @Post('chat')
  @ApiOperation({ summary: 'Pregunta a Krucn; responde en streaming (Server-Sent Events)' })
  async chat(@Body() dto: KrucnChatDto, @Req() req: Request, @Res() res: Response) {
    if (!this.krucn.enabled) {
      throw new HttpException({ message: 'Krucn no está disponible' }, HttpStatus.SERVICE_UNAVAILABLE);
    }
    if (!allow(req.ip ?? 'unknown')) {
      throw new HttpException({ message: 'Demasiadas preguntas, espera un momento' }, HttpStatus.TOO_MANY_REQUESTS);
    }

    res.status(200).set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders();
    const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    // Si el visitante cierra el diálogo, se corta la petición al modelo.
    const abort = new AbortController();
    res.on('close', () => abort.abort());

    try {
      const stop = await this.krucn.reply(dto, (text) => send({ text }), abort.signal);
      send({ done: true, stop });
    } catch (error) {
      if (!abort.signal.aborted) send({ error: true });
      if (!(error instanceof APIUserAbortError)) console.error('[krucn]', error);
    } finally {
      res.end();
    }
  }
}
