export interface Program {
  name: string;
  degree: string;
}

export interface School {
  slug: string;
  name: string;
  tagline: string;
  programs: Program[];
}

export const schools: School[] = [
  {
    slug: 'ingenieria',
    name: 'Escuela de Ingeniería',
    tagline:
      'Donde se construye la infraestructura del mundo digital: datos, inteligencia artificial y ciberseguridad.',
    programs: [
      { name: 'Cybersecurity', degree: 'BS' },
      { name: 'Data Science & Applied AI', degree: 'BS' },
      { name: 'Artificial Intelligence Engineering', degree: 'MSAIE' },
    ],
  },
  {
    slug: 'transformacion-de-negocios',
    name: 'Escuela de Transformación de Negocios',
    tagline: 'Para quienes quieren liderar organizaciones, no solo administrarlas.',
    programs: [
      { name: 'Business Management and Entrepreneurship', degree: 'BS' },
      { name: 'Management and Entrepreneurship', degree: 'MSME' },
    ],
  },
  {
    slug: 'bienestar-y-desarrollo-humano',
    name: 'Escuela de Bienestar y Desarrollo Humano',
    tagline:
      'La ciencia de vivir más y mejor, convertida en una industria de miles de millones de dólares.',
    programs: [
      { name: 'Integrative Wellness and Human Performance', degree: 'AAS' },
      { name: 'Aging Sciences and Health Management', degree: 'BS' },
      { name: 'Applied Neuroscience', degree: 'MS' },
      { name: 'Strategic Leadership for Aging Services & Vitality Stewardship', degree: 'MS' },
    ],
  },
  {
    slug: 'diseno-y-tecnologias-de-comunicacion',
    name: 'Escuela de Diseño y Tecnologías de Comunicación',
    tagline: 'Storytelling, diseño y tecnología para las industrias creativas del futuro.',
    programs: [
      { name: 'Digital Media', degree: 'BS' },
      { name: 'Digital Media, Film & Visual Design', degree: 'MFA' },
    ],
  },
];
