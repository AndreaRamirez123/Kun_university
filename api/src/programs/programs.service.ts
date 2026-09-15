import { Injectable, NotFoundException } from '@nestjs/common';
import { schools, type School } from './data/schools.data.js';
import { certifications, type Certification } from './data/certifications.data.js';

@Injectable()
export class ProgramsService {
  getSchools(): School[] {
    return schools;
  }

  getSchool(slug: string): School {
    const school = schools.find((s) => s.slug === slug);
    if (!school) {
      throw new NotFoundException(`No se encontró la escuela "${slug}"`);
    }
    return school;
  }

  getCertifications(): Certification[] {
    return certifications;
  }

  getStats() {
    const totalPrograms = schools.reduce((sum, s) => sum + s.programs.length, 0);
    return {
      schools: schools.length,
      programs: totalPrograms,
      certifications: certifications.length,
      online: 100,
    };
  }
}
