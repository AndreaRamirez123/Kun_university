export interface Localized {
  es: string;
  en: string;
}

export interface Course {
  code: string;
  title: string;
  credits: number;
}

export interface Semester {
  number: number;
  courses: Course[];
}

export interface Program {
  name: string;
  degree: string;
  totalCredits: number;
  semesters?: Semester[];
}

export interface School {
  slug: string;
  name: Localized;
  tagline: Localized;
  programs: Program[];
}

export interface Certification {
  slug: string;
  name: string;
  hours: number;
  description: Localized;
}

export interface Stats {
  schools: number;
  programs: number;
  certifications: number;
  online: number;
}
