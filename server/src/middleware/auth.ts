import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError } from './errorHandler';
import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  role: Role;
  email: string;
  iat: number;
  exp: number;
}

// Extend Express User
declare global {
  namespace Express {
    interface User {
      id: string;
      role: Role;
      email: string;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
    }
    return next();
  };
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
  } catch {
    // ignore
  }
  return next();
}

export async function requireEmailVerified(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { emailVerified: true } });
  if (!user?.emailVerified) {
    return next(new AppError('Please verify your email address', 403, 'EMAIL_NOT_VERIFIED'));
  }
  return next();
}
