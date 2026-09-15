export interface Certification {
  slug: string;
  name: string;
  hours: number;
  description: string;
}

export const certifications: Certification[] = [
  {
    slug: 'ai-business-architect',
    name: 'AI Business Architect',
    hours: 40,
    description:
      'Escala operaciones con IA: automatización de procesos y decisiones algorítmicas de negocio.',
  },
  {
    slug: 'venture-finance-pro',
    name: 'Venture Finance Pro',
    hours: 40,
    description: 'Domina la mecánica de venture capital: cap tables, equity y valoración corporativa.',
  },
  {
    slug: 'applied-ai-systems',
    name: 'Applied AI Systems',
    hours: 36,
    description: 'Fundamentos prácticos de inteligencia artificial y automatización aplicada.',
  },
  {
    slug: 'cyber-cloud-defense',
    name: 'Cyber Cloud Defense',
    hours: 36,
    description: 'Seguridad en la nube y protección de infraestructura digital, desde cero.',
  },
  {
    slug: 'executive-brain-architecture',
    name: 'Executive Brain Architecture',
    hours: 36,
    description: 'Neurotecnología y alto rendimiento estratégico para líderes ejecutivos.',
  },
  {
    slug: 'cognitive-resilience-management',
    name: 'Cognitive Resilience Management',
    hours: 36,
    description: 'Ciencia de la resiliencia cognitiva aplicada al liderazgo de alto desempeño.',
  },
];
