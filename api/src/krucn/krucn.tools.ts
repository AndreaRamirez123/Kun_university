import type Anthropic from '@anthropic-ai/sdk';
import { CAMPUS_PLACES, type CampusPlace } from './krucn.prompt.js';

// Herramientas de Krucn. guide_to, open_catalog y open_signup son acciones que
// ejecuta el campus en el navegador (el servidor solo las reenvía); save_lead se
// ejecuta aquí, en la API.

export type KrucnAction =
  | { type: 'guide'; place: CampusPlace }
  | { type: 'catalog'; school?: string; program?: string }
  | { type: 'signup'; program: string };

export type LeadInput = { email: string; name?: string; program?: string };

export const KRUCN_TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: 'guide_to',
    description:
      'Guía al visitante a un lugar del campus: aparece una luz sobre el edificio y Krucn camina con él hasta la puerta. Úsala cuando quiera ir a un lugar o parezca perdido.',
    input_schema: {
      type: 'object',
      properties: {
        place: { type: 'string', enum: Object.keys(CAMPUS_PLACES), description: 'Id del lugar del campus.' },
      },
      required: ['place'],
      additionalProperties: false,
    },
    strict: true,
    eager_input_streaming: true,
  },
  {
    name: 'open_catalog',
    description:
      'Abre el Catálogo académico en pantalla: en una escuela, en un programa con sus materias, o en la lista de escuelas si no se indica nada.',
    input_schema: {
      type: 'object',
      properties: {
        school: { type: 'string', description: 'Nombre de la escuela tal como aparece en el catálogo (campo "escuela").' },
        program: { type: 'string', description: 'Nombre del programa tal como aparece en el catálogo (campo "programa").' },
      },
      required: [],
      additionalProperties: false,
    },
    eager_input_streaming: true,
  },
  {
    name: 'open_signup',
    description: 'Abre el formulario de inscripción con el programa ya seleccionado. Úsala cuando el visitante quiera inscribirse.',
    input_schema: {
      type: 'object',
      properties: {
        program: { type: 'string', description: 'Nombre del programa tal como aparece en el catálogo (campo "programa").' },
      },
      required: ['program'],
      additionalProperties: false,
    },
    strict: true,
    eager_input_streaming: true,
  },
  {
    name: 'save_lead',
    description:
      'Guarda los datos de contacto del visitante para que admisiones lo contacte. Úsala solo si el visitante escribió su correo en la charla y aceptó ser contactado.',
    input_schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Correo electrónico que escribió el visitante.' },
        name: { type: 'string', description: 'Nombre del visitante, si lo dio.' },
        program: { type: 'string', description: 'Programa que le interesa, si se sabe.' },
      },
      required: ['email'],
      additionalProperties: false,
    },
    eager_input_streaming: true,
  },
];

const EMAIL = /^[^\s@,;<>]+@[^\s@,;<>]+\.[a-z]{2,}$/i;

function optionalText(value: unknown, max: number): string | undefined | null {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.length > max) return null;
  return value.trim() || undefined;
}

/**
 * Valida la entrada de una herramienta. Con eager_input_streaming la API no la
 * valida por nosotros (puede llegar incompleta), así que se revisa aquí.
 */
export function parseToolInput(
  name: string,
  input: unknown,
): { ok: true; action?: KrucnAction; lead?: LeadInput } | { ok: false; error: string } {
  const o = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  if (name === 'guide_to') {
    if (typeof o.place !== 'string' || !(o.place in CAMPUS_PLACES)) return { ok: false, error: 'place inválido' };
    return { ok: true, action: { type: 'guide', place: o.place as CampusPlace } };
  }
  if (name === 'open_catalog') {
    const school = optionalText(o.school, 160);
    const program = optionalText(o.program, 200);
    if (school === null || program === null) return { ok: false, error: 'school o program inválido' };
    return { ok: true, action: { type: 'catalog', school, program } };
  }
  if (name === 'open_signup') {
    const program = optionalText(o.program, 200);
    if (!program) return { ok: false, error: 'program requerido' };
    return { ok: true, action: { type: 'signup', program } };
  }
  if (name === 'save_lead') {
    const email = typeof o.email === 'string' ? o.email.trim() : '';
    const leadName = optionalText(o.name, 120);
    const program = optionalText(o.program, 200);
    if (!EMAIL.test(email) || email.length > 200) return { ok: false, error: 'correo inválido' };
    if (leadName === null || program === null) return { ok: false, error: 'name o program inválido' };
    return { ok: true, lead: { email, name: leadName, program } };
  }
  return { ok: false, error: `herramienta desconocida: ${name}` };
}
