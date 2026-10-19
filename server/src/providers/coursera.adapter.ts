import path from 'path';
import fs from 'fs';
import { ProviderAdapter } from './adapter.interface';
import { NormalizedCourse } from '../../../shared/src/index';
import { prisma } from '../lib/prisma';

export class CourseraAdapter implements ProviderAdapter {
  name = 'coursera';

  async fetchCatalog(): Promise<NormalizedCourse[]> {
    const provider = await prisma.provider.findUnique({ where: { name: 'coursera' } });
    if (!provider) throw new Error('Coursera provider not found');

    const dataPath = path.join(__dirname, '../../data/coursera.json');
    const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    return raw.map((c: Record<string, unknown>) => ({
      externalId: c.externalId as string,
      providerId: provider.id,
      title: c.title as string,
      description: c.description as string,
      level: c.level as NormalizedCourse['level'],
      durationHours: c.durationHours as number,
      language: (c.language as string) || 'en',
      skills: (c.skills as string[]) || [],
      url: c.url as string,
      cost: (c.cost as number) || 0,
      certificateAvailable: (c.certificateAvailable as boolean) || false,
      thumbnailUrl: (c.thumbnailUrl as string | null) || null,
      instructor: c.instructor as string,
      rating: c.rating as number,
      enrollmentCount: c.enrollmentCount as number,
    }));
  }

  getDeepLink(course: { url: string }): string {
    return course.url;
  }
}
