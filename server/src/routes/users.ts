import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { UpdateProfileSchema, OnboardingSchema } from '@omc/shared';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security: [{bearerAuth: []}]
 */
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, emailVerified: true, createdAt: true,
        profile: true,
      },
    });
    if (!user) return next(new AppError('User not found', 404));
    return res.json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update current user basic info
 */
router.patch('/me', validate(UpdateProfileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, ...profileData } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        profile: {
          upsert: {
            create: profileData,
            update: profileData,
          },
        },
      },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, emailVerified: true, profile: true,
      },
    });

    return res.json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /users/me/onboarding:
 *   post:
 *     tags: [Users]
 *     summary: Complete onboarding wizard
 */
router.post('/me/onboarding', validate(OnboardingSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skillLevel, goals, region, country, preferredLanguage, dataSaverMode } = req.body;

    const profile = await prisma.profile.upsert({
      where: { userId: req.user!.id },
      create: {
        userId: req.user!.id,
        skillLevel,
        goals,
        region,
        country,
        preferredLanguage,
        dataSaverMode,
        onboardingCompleted: true,
      },
      update: {
        skillLevel,
        goals,
        region,
        country,
        preferredLanguage,
        dataSaverMode,
        onboardingCompleted: true,
      },
    });

    return res.json({ success: true, data: profile });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /users/me/delete:
 *   delete:
 *     tags: [Users]
 *     summary: Delete account (GDPR)
 */
router.delete('/me/delete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.user.delete({ where: { id: req.user!.id } });
    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /users/me/export:
 *   get:
 *     tags: [Users]
 *     summary: Export all user data (GDPR)
 */
router.get('/me/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: true,
        enrollments: { include: { course: true } },
        credentials: true,
        progressEvents: true,
        cohortMemberships: true,
      },
    });
    res.setHeader('Content-Disposition', 'attachment; filename=my-data.json');
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(user, null, 2));
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get public user profile
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, firstName: true, lastName: true, role: true, createdAt: true,
        profile: {
          select: {
            avatarUrl: true, bio: true, region: true, country: true,
            skillLevel: true, goals: true, totalHours: true, streakDays: true,
          },
        },
        credentials: {
          select: { id: true, type: true, title: true, issuer: true, issuedAt: true, verifyCode: true },
        },
      },
    });
    if (!user) return next(new AppError('User not found', 404));
    return res.json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
});

export default router;
