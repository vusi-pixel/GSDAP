import { prisma } from '../lib/prisma';
import { NormalizedCourse } from '../../../shared/src/index';
import { logger } from '../lib/logger';
import { cache } from '../lib/redis';

export async function syncProvider(providerName: string, triggeredBy = 'scheduled') {
  const provider = await prisma.provider.findUnique({ where: { name: providerName as any } });
  if (!provider) throw new Error(`Provider ${providerName} not found`);

  // Create sync log
  const syncLog = await prisma.syncLog.create({
    data: {
      providerId: provider.id,
      status: 'running',
      triggeredBy,
    },
  });

  try {
    const { getAdapter } = await import('../providers/index');
    const adapter = getAdapter(providerName);
    if (!adapter) throw new Error(`No adapter for provider: ${providerName}`);

    const courses: NormalizedCourse[] = await adapter.fetchCatalog();

    let added = 0;
    let updated = 0;

    for (const course of courses) {
      const existing = await prisma.course.findFirst({
        where: { providerId: provider.id, externalId: course.externalId },
      });

      if (existing) {
        await prisma.course.update({
          where: { id: existing.id },
          data: {
            title: course.title,
            description: course.description,
            level: course.level,
            durationHours: course.durationHours,
            language: course.language,
            skills: course.skills,
            url: course.url,
            cost: course.cost,
            certificateAvailable: course.certificateAvailable,
            thumbnailUrl: course.thumbnailUrl,
            instructor: course.instructor,
            rating: course.rating,
            enrollmentCount: course.enrollmentCount,
          },
        });
        updated++;
      } else {
        await prisma.course.create({
          data: {
            externalId: course.externalId,
            providerId: provider.id,
            title: course.title,
            description: course.description,
            level: course.level,
            durationHours: course.durationHours,
            language: course.language,
            skills: course.skills,
            url: course.url,
            cost: course.cost,
            certificateAvailable: course.certificateAvailable,
            thumbnailUrl: course.thumbnailUrl,
            instructor: course.instructor,
            rating: course.rating,
            enrollmentCount: course.enrollmentCount,
          },
        });
        added++;
      }
    }

    // Invalidate catalog cache
    await cache.delPattern('catalog:*');

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'success',
        coursesAdded: added,
        coursesUpdated: updated,
        finishedAt: new Date(),
      },
    });

    logger.info({ providerName, added, updated }, 'Sync completed');
    return { added, updated };
  } catch (error) {
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        finishedAt: new Date(),
      },
    });
    logger.error({ error, providerName }, 'Sync failed');
    throw error;
  }
}

export async function syncAllProviders() {
  const providers = ['coursera', 'google', 'microsoft', 'nvidia', 'tvet'];
  const results = await Promise.allSettled(providers.map((p) => syncProvider(p, 'scheduled')));
  return results.map((r, i) => ({
    provider: providers[i],
    status: r.status,
    ...(r.status === 'fulfilled' ? r.value : { error: (r.reason as Error).message }),
  }));
}
