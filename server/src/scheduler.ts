import cron from 'node-cron';
import { enqueueAllSyncs } from './workers';
import { logger } from './lib/logger';

export function startScheduler() {
  // Sync all providers every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Running scheduled provider sync');
    await enqueueAllSyncs('scheduled');
  });

  // Daily streak check at midnight
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running daily streak reset check');
    // Reset streaks for inactive users (>24h since last activity)
    // This would call a service method in production
  });

  logger.info('Cron scheduler initialized (sync every 6 hours)');
}
