import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { cache } from '../lib/redis';
import { CatalogQuerySchema } from '../../../shared/src/index';
import { validate } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { Prisma } from '@prisma/client';

const router = Router();

/**
 * @openapi
 * /catalog:
 *   get:
 *     tags: [Catalog]
 *     summary: List courses with filtering, search, and pagination
 */
router.get('/', optionalAuth, validate(CatalogQuerySchema, 'query'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page, limit, search, provider, level, language,
      free, certificate, skill, sortBy, sortOrder,
    } = req.query as unknown as import('../../../shared/src/index').CatalogQuery;

    const cacheKey = `catalog:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const where: Prisma.CourseWhereInput = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { skills: { has: search } },
      ];
    }

    if (provider) {
      const providers = Array.isArray(provider) ? provider : [provider];
      where.provider = { name: { in: providers as Prisma.EnumProviderNameFilter['in'] } };
    }

    if (level) where.level = level as Prisma.EnumCourseLevelFilter['equals'];
    if (language) where.language = language;
    if (free === true) where.cost = 0;
    if (certificate === true) where.certificateAvailable = true;
    if (skill) where.skills = { has: skill };

    const orderBy: Prisma.CourseOrderByWithRelationInput =
      sortBy === 'popularity'
        ? { enrollmentCount: sortOrder }
        : { [sortBy]: sortOrder };

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        include: {
          provider: { select: { name: true, displayName: true, logoUrl: true } },
          institution: { select: { name: true, country: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const response = {
      success: true,
      data: courses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };

    await cache.set(cacheKey, response, 300); // 5 min cache
    return res.json(response);
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /catalog/featured:
 *   get:
 *     tags: [Catalog]
 *     summary: Get featured courses for landing page
 */
router.get('/featured', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = await cache.get('catalog:featured');
    if (cached) return res.json(cached);

    const courses = await prisma.course.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        provider: { select: { name: true, displayName: true, logoUrl: true } },
      },
      take: 10,
      orderBy: { enrollmentCount: 'desc' },
    });

    const response = { success: true, data: courses };
    await cache.set('catalog:featured', response, 600);
    return res.json(response);
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /catalog/stats:
 *   get:
 *     tags: [Catalog]
 *     summary: Get platform stats (learner counter etc.)
 */
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cached = await cache.get('catalog:stats');
    if (cached) return res.json(cached);

    const [totalUsers, totalCourses, totalEnrollments, totalCompletions, coursesByProvider] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.course.count({ where: { isActive: true } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: 'completed' } }),
      prisma.provider.findMany({
        select: {
          name: true,
          displayName: true,
          _count: { select: { courses: true } },
        },
      }),
    ]);

    const response = {
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalCompletions,
        coursesByProvider: coursesByProvider.map((p) => ({
          provider: p.name,
          displayName: p.displayName,
          count: p._count.courses,
        })),
        milestoneTarget: 1000000,
        milestoneProgress: totalUsers,
      },
    };

    await cache.set('catalog:stats', response, 60);
    return res.json(response);
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /catalog/{id}:
 *   get:
 *     tags: [Catalog]
 *     summary: Get course detail
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        provider: true,
        institution: true,
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) return next(new AppError('Course not found', 404));

    // Check enrollment status if user is logged in
    let enrollment = null;
    if (req.user) {
      enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.user.id, courseId: course.id } },
      });
    }

    return res.json({ success: true, data: { ...course, enrollment } });
  } catch (err) {
    return next(err);
  }
});

export default router;
