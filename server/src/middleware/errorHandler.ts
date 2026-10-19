import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Prisma errors
  if (err.constructor?.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as unknown as { code: string; meta?: { target?: string[] } };
    if (prismaErr.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: `A record with that ${prismaErr.meta?.target?.join(', ')} already exists.`,
        code: 'DUPLICATE',
      });
    }
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
        code: 'NOT_FOUND',
      });
    }
  }

  // Zod errors
  if (err.name === 'ZodError') {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: (err as any).errors?.map((e: any) => ({
        field: e.path?.join('.'),
        message: e.message,
      })) || [],
    });
  }

  // Unexpected errors
  logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
  });
}
