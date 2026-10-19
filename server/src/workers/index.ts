import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis';
import { syncProvider } from '../services/sync.service';
import { logger } from '../lib/logger';

// ─── Queue ────────────────────────────────────────────────────────────────────

export const syncQueue = new Queue('provider-sync', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// ─── Worker ───────────────────────────────────────────────────────────────────

let syncWorker: Worker;

export async function startWorkers() {
  syncWorker = new Worker(
    'provider-sync',
    async (job) => {
      const { providerName, triggeredBy } = job.data as { providerName: string; triggeredBy: string };
      logger.info({ providerName, triggeredBy }, 'Starting sync job');
      const result = await syncProvider(providerName, triggeredBy);
      return result;
    },
    {
      connection: redis,
      concurrency: 2,
    },
  );

  syncWorker.on('completed', (job, result) => {
    logger.info({ jobId: job.id, result }, 'Sync job completed');
  });

  syncWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Sync job failed');
  });

  logger.info('BullMQ workers started');
}

export async function enqueueSyncJob(providerName: string, triggeredBy = 'manual') {
  return syncQueue.add(`sync-${providerName}`, { providerName, triggeredBy }, { priority: triggeredBy === 'manual' ? 1 : 5 });
}

export async function enqueueAllSyncs(triggeredBy = 'scheduled') {
  const providers = ['coursera', 'google', 'microsoft', 'nvidia', 'tvet'];
  return Promise.all(providers.map((p) => enqueueSyncJob(p, triggeredBy)));
}
