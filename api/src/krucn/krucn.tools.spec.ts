import { buildSystemPrompt } from './krucn.prompt.js';
import { KRUCN_TOOLS, parseToolInput } from './krucn.tools.js';

describe('parseToolInput', () => {
  it('acepta guide_to con un lugar del campus', () => {
    expect(parseToolInput('guide_to', { place: 'ing' })).toEqual({ ok: true, action: { type: 'guide', place: 'ing' } });
  });

  it('rechaza lugares que no existen', () => {
    expect(parseToolInput('guide_to', { place: 'cafeteria' }).ok).toBe(false);
    expect(parseToolInput('guide_to', {}).ok).toBe(false);
  });

  it('open_catalog funciona sin datos y con programa', () => {
    expect(parseToolInput('open_catalog', {})).toEqual({ ok: true, action: { type: 'catalog' } });
    expect(parseToolInput('open_catalog', { program: 'Cybersecurity' })).toEqual({
      ok: true,
      action: { type: 'catalog', school: undefined, program: 'Cybersecurity' },
    });
  });

  it('open_signup exige programa', () => {
    expect(parseToolInput('open_signup', { program: '  ' }).ok).toBe(false);
    expect(parseToolInput('open_signup', { program: 'Cybersecurity' }).ok).toBe(true);
  });

  it('save_lead valida el correo', () => {
    expect(parseToolInput('save_lead', { email: 'no-es-correo' }).ok).toBe(false);
    expect(parseToolInput('save_lead', { email: 'ana@example.com,' }).ok).toBe(false);
    expect(parseToolInput('save_lead', { email: 'luis.sosa@cun.edu.co' }).ok).toBe(true);
    expect(parseToolInput('save_lead', { email: 'ana@example.com', name: 'Ana' })).toEqual({
      ok: true,
      lead: { email: 'ana@example.com', name: 'Ana', program: undefined },
    });
  });

  it('rechaza herramientas desconocidas', () => {
    expect(parseToolInput('borrar_todo', {}).ok).toBe(false);
  });

  it('cada herramienta definida tiene validación', () => {
    for (const tool of KRUCN_TOOLS) {
      expect(parseToolInput(tool.name, {}).ok === false || tool.name === 'open_catalog').toBe(true);
    }
  });
});

describe('buildSystemPrompt', () => {
  it('incluye el catálogo y la información oficial sin los comentarios de edición', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('<catalogo_academico');
    expect(prompt).toContain('admissions@kununiversityai.com');
    expect(prompt).toContain('PENDIENTE');
    expect(prompt).toContain('### ¿Hay becas o descuentos?');
    expect(prompt).not.toContain('claves');
  });
});
