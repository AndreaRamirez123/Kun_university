import type { Localized } from './schools.data.js';

export interface Certification {
  slug: string;
  name: string;
  hours: number;
  description: Localized;
}

export const certifications: Certification[] = [
  {
    slug: 'ai-business-architect',
    name: 'AI Business Architect',
    hours: 40,
    description: {
      es: 'Escala operaciones con IA: automatización de procesos y decisiones algorítmicas de negocio.',
      en: 'Scale operations with AI: process automation and algorithmic business decisions.',
    },
  },
  {
    slug: 'venture-finance-pro',
    name: 'Venture Finance Pro',
    hours: 40,
    description: {
      es: 'Domina la mecánica de venture capital: cap tables, equity y valoración corporativa.',
      en: 'Master the mechanics of venture capital: cap tables, equity and corporate valuation.',
    },
  },
  {
    slug: 'applied-ai-systems',
    name: 'Applied AI Systems',
    hours: 36,
    description: {
      es: 'Fundamentos prácticos de inteligencia artificial y automatización aplicada.',
      en: 'Practical foundations of artificial intelligence and applied automation.',
    },
  },
  {
    slug: 'cyber-cloud-defense',
    name: 'Cyber Cloud Defense',
    hours: 36,
    description: {
      es: 'Seguridad en la nube y protección de infraestructura digital, desde cero.',
      en: 'Cloud security and digital infrastructure protection, from the ground up.',
    },
  },
  {
    slug: 'executive-brain-architecture',
    name: 'Executive Brain Architecture',
    hours: 36,
    description: {
      es: 'Neurotecnología y alto rendimiento estratégico para líderes ejecutivos.',
      en: 'Neurotechnology and strategic high performance for executive leaders.',
    },
  },
  {
    slug: 'cognitive-resilience-management',
    name: 'Cognitive Resilience Management',
    hours: 36,
    description: {
      es: 'Ciencia de la resiliencia cognitiva aplicada al liderazgo de alto desempeño.',
      en: 'The science of cognitive resilience applied to high-performance leadership.',
    },
  },
];
