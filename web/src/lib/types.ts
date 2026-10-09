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
  name: string;
  tagline: string;
  programs: Program[];
}

export interface Certification {
  slug: string;
  name: string;
  hours: number;
  description: string;
}

export interface Stats {
  schools: number;
  programs: number;
  certifications: number;
  online: number;
}
