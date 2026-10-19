import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error']
      : ['warn', 'error'],
  });

if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
  // @ts-expect-error - Prisma event
  prisma.$on('query', (e: { query: string; duration: number }) => {
    if (process.env.LOG_LEVEL === 'debug') {
      logger.debug({ query: e.query, duration: e.duration }, 'Prisma query');
    }
  });
}
