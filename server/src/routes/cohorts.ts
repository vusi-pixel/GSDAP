import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreateCohortSchema } from '../../../shared/src/index';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /cohorts:
 *   get:
 *     tags: [Cohorts]
 *     summary: List cohorts
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cohorts = await prisma.cohort.findMany({
      where: { status: 'active' },
      include: {
        mentor: { select: { firstName: true, lastName: true } },
        institution: { select: { name: true } },
        path: { select: { title: true, goal: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: cohorts });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /cohorts:
 *   post:
 *     tags: [Cohorts]
 *     summary: Create a cohort (mentor and admin only)
 */
router.post(
  '/',
  authorize('mentor', 'tvet_admin', 'super_admin'),
  validate(CreateCohortSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, pathId, institutionId, maxMembers, startDate, endDate } = req.body;
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const cohort = await prisma.cohort.create({
        data: {
          name,
          description,
          mentorId: req.user!.id,
          pathId,
          institutionId,
          maxMembers,
          startDate,
          endDate,
          inviteCode,
        },
        include: {
          path: { select: { title: true } },
          _count: { select: { members: true } },
        },
      });

      return res.status(201).json({ success: true, data: cohort });
    } catch (err) {
      return next(err);
    }
  },
);

/**
 * @openapi
 * /cohorts/{id}:
 *   get:
 *     tags: [Cohorts]
 *     summary: Get cohort detail
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cohort = await prisma.cohort.findUnique({
      where: { id: req.params.id },
      include: {
        mentor: { select: { firstName: true, lastName: true } },
        institution: { select: { name: true, country: true } },
        path: { include: { steps: { include: { course: true } } } },
        members: {
          include: {
            user: {
              select: { firstName: true, lastName: true, profile: { select: { avatarUrl: true } } },
            },
          },
          orderBy: { score: 'desc' },
        },
      },
    });
    if (!cohort) return next(new AppError('Cohort not found', 404));
    return res.json({ success: true, data: cohort });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /cohorts/join/{code}:
 *   post:
 *     tags: [Cohorts]
 *     summary: Join a cohort by invite code
 */
router.post('/join/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cohort = await prisma.cohort.findUnique({ where: { inviteCode: req.params.code.toUpperCase() } });
    if (!cohort) return next(new AppError('Invalid invite code', 404));
    if (cohort.status !== 'active') return next(new AppError('Cohort is not active', 400));

    const memberCount = await prisma.cohortMember.count({ where: { cohortId: cohort.id } });
    if (cohort.maxMembers && memberCount >= cohort.maxMembers) {
      return next(new AppError('Cohort is full', 400));
    }

    const member = await prisma.cohortMember.upsert({
      where: { cohortId_userId: { cohortId: cohort.id, userId: req.user!.id } },
      create: { cohortId: cohort.id, userId: req.user!.id },
      update: {},
    });

    return res.status(201).json({ success: true, data: member, cohortId: cohort.id });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /cohorts/{id}/leaderboard:
 *   get:
 *     tags: [Cohorts]
 *     summary: Get cohort leaderboard
 */
router.get('/:id/leaderboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await prisma.cohortMember.findMany({
      where: { cohortId: req.params.id },
      include: {
        user: {
          select: {
            id: true, firstName: true, lastName: true,
            profile: { select: { avatarUrl: true, totalHours: true, streakDays: true } },
          },
        },
      },
      orderBy: { score: 'desc' },
      take: 50,
    });

    return res.json({ success: true, data: members });
  } catch (err) {
    return next(err);
  }
});

export default router;
