import 'dotenv/config';
import app from './app';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';
import { logger } from './lib/logger';
import { startWorkers } from './workers';
import { startScheduler } from './scheduler';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    // Test DB connection
    try {
      await prisma.$connect();
      logger.info('✅ PostgreSQL connected');
    } catch (dbErr) {
      logger.warn('⚠️ PostgreSQL offline — server running with API documentation & health check available');
    }

    // Test Redis connection
    try {
      await redis.connect();
      await redis.ping();
      logger.info('✅ Redis connected');

      // Start BullMQ workers
      await startWorkers();
      logger.info('✅ Background workers started');
    } catch (redisErr) {
      logger.warn('⚠️ Redis offline — caching and queue workers running in passive mode');
    }

    // Start cron scheduler
    try {
      startScheduler();
      logger.info('✅ Scheduler started');
    } catch (schedErr) {
      logger.warn('⚠️ Scheduler paused');
    }

    const server = app.listen(PORT, () => {
      logger.info(`🚀 API server running on http://localhost:${PORT}`);
      logger.info(`📖 API docs at http://localhost:${PORT}/api-docs`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        try { await prisma.$disconnect(); } catch {}
        try { redis.disconnect(); } catch {}
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap();
