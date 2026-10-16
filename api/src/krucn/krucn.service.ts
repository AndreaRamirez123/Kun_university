import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import type { KrucnChatDto } from './dto/krucn-chat.dto.js';
import { buildSystemPrompt } from './krucn.prompt.js';

// Solo los últimos turnos: Krucn es una charla corta, no un chat infinito.
const MAX_TURNS = 12;

@Injectable()
export class KrucnService {
  private readonly logger = new Logger(KrucnService.name);
  // Se leen al crear el servicio, cuando ConfigModule ya cargó el .env.
  private readonly model = process.env.KRUCN_MODEL ?? 'claude-opus-5-5';
  private readonly client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
  private readonly system = buildSystemPrompt();

  get enabled() {
    return this.client !== null;
  }

  /** Respuesta de Krucn en streaming: emite cada fragmento de texto con onText. */
  async reply(dto: KrucnChatDto, onText: (text: string) => void, signal: AbortSignal) {
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

    const stream = this.client.beta.messages.stream(
      {
        model: this.model,
        max_tokens: 16000,
        output_config: { effort: 'low' },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: [{ type: 'text', text: this.system, cache_control: { type: 'ephemeral', ttl: '1h' } }],
        messages,
      },
      { signal },
    );
    stream.on('text', onText);

    const final = await stream.finalMessage();
    const { usage } = final;
    this.logger.log(
      `stop=${final.stop_reason} in=${usage.input_tokens} cache_read=${usage.cache_read_input_tokens ?? 0} out=${usage.output_tokens}`,
    );
    return final.stop_reason;
  }
}
