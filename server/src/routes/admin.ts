import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { enqueueSyncJob } from '../workers';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);
router.use(authorize('super_admin', 'tvet_admin'));

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Platform-wide analytics
 */
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers, totalLearners, totalCourses, totalEnrollments,
      totalCompletions, completionsByProvider, signupsByRegion,
      recentSignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'learner' } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: 'completed' } }),
      prisma.provider.findMany({
        select: {
          name: true,
          displayName: true,
          courses: {
            select: {
              enrollments: {
                where: { status: 'completed' },
                select: { id: true },
              },
            },
          },
        },
      }),
      prisma.profile.groupBy({
        by: ['region'],
        _count: { userId: true },
        where: { region: { not: null } },
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: { createdAt: true },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalLearners,
          totalCourses,
          totalEnrollments,
          totalCompletions,
          completionRate: totalEnrollments > 0 ? ((totalCompletions / totalEnrollments) * 100).toFixed(1) : '0',
          milestoneProgress: totalLearners,
          milestoneTarget: 1000000,
        },
        completionsByProvider: completionsByProvider.map((p) => ({
          provider: p.name,
          displayName: p.displayName,
          completions: p.courses.reduce((sum, c) => sum + c.enrollments.length, 0),
        })),
        signupsByRegion,
        recentSignups,
      },
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 */
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const search = req.query.search as string;
    const role = req.query.role as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, emailVerified: true, isActive: true, createdAt: true, lastLoginAt: true,
          profile: { select: { region: true, country: true, skillLevel: true, totalHours: true } },
          _count: { select: { enrollments: true, credentials: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({
      success: true,
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user role (super_admin only)
 */
router.patch('/users/:id/role', authorize('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    if (!['learner', 'mentor', 'tvet_admin', 'super_admin'].includes(role)) {
      return next(new AppError('Invalid role', 400));
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, email: true, role: true },
    });
    return res.json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /admin/users/{id}/deactivate:
 *   patch:
 *     tags: [Admin]
 *     summary: Deactivate user account
 */
router.patch('/users/:id/deactivate', authorize('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    return res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /admin/providers:
 *   get:
 *     tags: [Admin]
 *     summary: List providers with sync status
 */
router.get('/providers', authorize('super_admin'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        _count: { select: { courses: true } },
        syncLogs: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    });
    return res.json({ success: true, data: providers });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /admin/sync/{providerName}:
 *   post:
 *     tags: [Admin]
 *     summary: Trigger manual sync for a provider
 */
router.post('/sync/:providerName', authorize('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await enqueueSyncJob(req.params.providerName, 'manual');
    return res.json({ success: true, message: `Sync job queued`, jobId: job.id });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /admin/institutions:
 *   get:
 *     tags: [Admin]
 *     summary: List TVET institutions
 */
router.get('/institutions', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const institutions = await prisma.institution.findMany({
      include: {
        _count: { select: { courses: true, staff: true, cohorts: true } },
      },
      orderBy: { name: 'asc' },
    });
    return res.json({ success: true, data: institutions });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /admin/institutions:
 *   post:
 *     tags: [Admin]
 *     summary: Create TVET institution
 */
router.post('/institutions', authorize('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, country, region, website, description } = req.body;
    const institution = await prisma.institution.create({
      data: { name, country, region, website, description },
    });
    return res.status(201).json({ success: true, data: institution });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /admin/sync-logs:
 *   get:
 *     tags: [Admin]
 *     summary: Get sync history
 */
router.get('/sync-logs', authorize('super_admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.syncLog.findMany({
      include: { provider: { select: { name: true, displayName: true } } },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
    return res.json({ success: true, data: logs });
  } catch (err) {
    return next(err);
  }
});

export default router;
