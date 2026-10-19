import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler';

type ValidateTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      (result.error as ZodError).errors.forEach((e) => {
        const key = e.path.join('.') || 'root';
        if (!errors[key]) errors[key] = [];
        errors[key].push(e.message);
      });
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    req[target] = result.data;
    return next();
  };
}

export function paginate(req: Request, res: Response, next: NextFunction) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  req.query.page = String(page);
  req.query.limit = String(limit);
  return next();
}
