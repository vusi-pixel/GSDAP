import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { sendMail, verificationEmailHtml, resetPasswordEmailHtml } from '../lib/email';
import { Role } from '@prisma/client';
import { logger } from '../lib/logger';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export function generateTokens(userId: string, role: Role, email: string) {
  const accessToken = jwt.sign({ sub: userId, role, email }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign({ sub: userId, role, email }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES as jwt.SignOptions['expiresIn'],
  });
  return { accessToken, refreshToken };
}

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already in use', 409, 'EMAIL_TAKEN');

  const passwordHash = await argon2.hash(password);
  const verifyToken = crypto.randomBytes(32).toString('hex');
  const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      verifyToken,
      verifyTokenExpiry,
      profile: { create: {} },
    },
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
  await sendMail({
    to: email,
    subject: 'Verify your One Million Coders email',
    html: verificationEmailHtml(firstName, verifyUrl),
  }).catch((err) => logger.warn(err, 'Failed to send verification email'));

  return user;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) throw new AppError('Account is deactivated', 403, 'ACCOUNT_INACTIVE');

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');

  // Update last login
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.email);

  // Store refresh token
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: expiry },
  });

  return { user, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: { sub: string; role: Role; email: string };
  try {
    payload = jwt.verify(refreshToken, REFRESH_SECRET) as typeof payload;
  } catch {
    throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token revoked or expired', 401, 'TOKEN_EXPIRED');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw new AppError('User not found', 401, 'UNAUTHORIZED');

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role, user.email);

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: user.id, expiresAt: expiry },
  });

  return { accessToken, refreshToken: newRefreshToken, user };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true },
  });
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({
    where: { verifyToken: token, verifyTokenExpiry: { gt: new Date() } },
  });
  if (!user) throw new AppError('Invalid or expired verification token', 400, 'INVALID_TOKEN');

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null, verifyTokenExpiry: null },
  });
  return user;
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // Don't leak if email exists

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendMail({
    to: email,
    subject: 'Reset your One Million Coders password',
    html: resetPasswordEmailHtml(user.firstName, resetUrl),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });
  if (!user) throw new AppError('Invalid or expired reset token', 400, 'INVALID_TOKEN');

  const passwordHash = await argon2.hash(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  // Revoke all refresh tokens
  await prisma.refreshToken.updateMany({
    where: { userId: user.id },
    data: { revoked: true },
  });
}

export async function googleAuth(profile: {
  id: string;
  emails?: Array<{ value: string }>;
  name?: { givenName?: string; familyName?: string };
  photos?: Array<{ value: string }>;
}) {
  const email = profile.emails?.[0]?.value;
  if (!email) throw new AppError('No email from Google', 400, 'GOOGLE_NO_EMAIL');

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.id }, { email }] },
    include: { profile: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        googleId: profile.id,
        firstName: profile.name?.givenName || 'User',
        lastName: profile.name?.familyName || '',
        emailVerified: true,
        profile: {
          create: {
            avatarUrl: profile.photos?.[0]?.value || null,
          },
        },
      },
      include: { profile: true },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId: profile.id, emailVerified: true },
      include: { profile: true },
    });
  }

  return user;
}
