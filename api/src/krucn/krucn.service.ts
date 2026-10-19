import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service.js';
import type { KrucnChatDto } from './dto/krucn-chat.dto.js';
import { buildSystemPrompt } from './krucn.prompt.js';
import { KRUCN_TOOLS, parseToolInput, type KrucnAction } from './krucn.tools.js';

// Solo los últimos turnos: Krucn es una charla corta, no un chat infinito.
const MAX_TURNS = 16;
// Vueltas de herramientas por pregunta (p. ej. guardar el correo y luego guiar).
const MAX_TOOL_ROUNDS = 4;

export type KrucnEvents = {
  onText: (text: string) => void;
  onAction: (action: KrucnAction) => void;
};

@Injectable()
export class KrucnService {
  private readonly logger = new Logger(KrucnService.name);
  // Se leen al crear el servicio, cuando ConfigModule ya cargó el .env.
  private readonly model = process.env.KRUCN_MODEL ?? 'claude-opus-5-5';
  private readonly client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
  private readonly system = buildSystemPrompt();

  constructor(private readonly leads: LeadsService) {}

  get enabled() {
    return this.client !== null;
  }

  /** Respuesta de Krucn en streaming: texto con onText y acciones del campus con onAction. */
  async reply(dto: KrucnChatDto, events: KrucnEvents, signal: AbortSignal) {
    if (!this.client) {
      throw new ServiceUnavailableException('Krucn no tiene ANTHROPIC_API_KEY configurada');
    }

    const turns = dto.messages.slice(-MAX_TURNS);
    // La API exige que la conversación empiece con el visitante.
    while (turns.length && turns[0].role !== 'user') turns.shift();
    const messages: Anthropic.Beta.BetaMessageParam[] = turns.map((t) => ({ role: t.role, content: t.content }));

    // El contexto cambia en cada pregunta, así que va como mensaje de sistema al
    // final y no en el system prompt (que queda fijo y en caché).
    const context = [
      `Idioma de la respuesta: ${dto.locale === 'es' ? 'español' : 'inglés'}.`,
      dto.playerName ? `El visitante se llama ${dto.playerName}.` : 'El visitante no dio su nombre.',
      dto.nearestPlace ? `Lugar del campus más cercano al visitante: ${dto.nearestPlace}.` : '',
    ]
      .filter(Boolean)
      .join(' ');
    messages.push({ role: 'system', content: context });

    let wroteText = false;
    let stop: string | null = null;
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const stream = this.client.beta.messages.stream(
        {
          model: this.model,
          max_tokens: 16000,
          output_config: { effort: 'low' },
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          system: [{ type: 'text', text: this.system, cache_control: { type: 'ephemeral', ttl: '1h' } }],
          tools: KRUCN_TOOLS,
          messages,
        },
        { signal },
      );
      let roundText = false;
      stream.on('text', (text) => {
        // Separa el texto de una vuelta del de la anterior.
        if (!roundText && wroteText) events.onText(' ');
        roundText = true;
        wroteText = true;
        events.onText(text);
      });

      const final = await stream.finalMessage();
      stop = final.stop_reason;
      const { usage } = final;
      this.logger.log(
        `round=${round} stop=${stop} in=${usage.input_tokens} cache_read=${usage.cache_read_input_tokens ?? 0} out=${usage.output_tokens}`,
      );

      const toolUses = final.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use');
      // Una entrada cortada por max_tokens puede parecer válida, y un rechazo puede
      // dejar una herramienta a medias: en ninguno de los dos casos se ejecuta.
      if (stop !== 'tool_use' || toolUses.length === 0) break;

      const results: Anthropic.Beta.BetaToolResultBlockParam[] = toolUses.map((use) => {
        const parsed = parseToolInput(use.name, use.input);
        if (!parsed.ok) {
          return { type: 'tool_result', tool_use_id: use.id, is_error: true, content: parsed.error };
        }
        if (parsed.lead) {
          this.leads.create({ ...parsed.lead, source: 'krucn_chat' });
          return { type: 'tool_result', tool_use_id: use.id, content: 'Datos guardados para admisiones.' };
        }
        if (parsed.action) events.onAction(parsed.action);
        return { type: 'tool_result', tool_use_id: use.id, content: 'Hecho: el campus ya lo muestra en pantalla.' };
      });
      // El contenido del asistente se devuelve sin cambios (incluye su razonamiento).
      messages.push({ role: 'assistant', content: final.content });
      messages.push({ role: 'user', content: results });
    }
    return stop;
  }
}
