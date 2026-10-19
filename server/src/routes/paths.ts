import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreatePathSchema } from '../../../shared/src/index';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /paths/recommend:
 *   get:
 *     tags: [Paths]
 *     summary: Get recommended learning paths based on profile
 */
router.get('/recommend', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.id } });

    // Find official paths matching the user's goals and level
    const whereClause: any = {
      isPublic: true,
    };

    if (profile?.goals?.length) {
      whereClause.goal = { in: profile.goals };
    }

    const paths = await prisma.learningPath.findMany({
      where: whereClause,
      include: {
        steps: {
          include: {
            course: {
              include: { provider: { select: { name: true, displayName: true } } },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: { select: { enrollments: true } },
      },
      take: 6,
    });

    return res.json({ success: true, data: paths });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /paths:
 *   get:
 *     tags: [Paths]
 *     summary: List all public learning paths
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);

    const [total, paths] = await Promise.all([
      prisma.learningPath.count({ where: { isPublic: true } }),
      prisma.learningPath.findMany({
        where: { isPublic: true },
        include: {
          steps: {
            include: {
              course: { include: { provider: { select: { name: true, displayName: true } } } },
            },
            orderBy: { order: 'asc' },
          },
          _count: { select: { enrollments: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return res.json({
      success: true,
      data: paths,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /paths:
 *   post:
 *     tags: [Paths]
 *     summary: Create a new learning path
 */
router.post('/', validate(CreatePathSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, goal, steps } = req.body;

    const path = await prisma.learningPath.create({
      data: {
        title,
        description,
        goal,
        createdById: req.user!.id,
        isPublic: req.user!.role !== 'learner',
        isOfficial: ['super_admin', 'tvet_admin'].includes(req.user!.role),
        steps: {
          create: steps.map((s: { courseId: string; order: number; required: boolean; notes?: string }) => ({
            courseId: s.courseId,
            order: s.order,
            required: s.required,
            notes: s.notes,
          })),
        },
      },
      include: {
        steps: {
          include: { course: { include: { provider: true } } },
          orderBy: { order: 'asc' },
        },
      },
    });

    return res.status(201).json({ success: true, data: path });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /paths/{id}:
 *   get:
 *     tags: [Paths]
 *     summary: Get learning path detail
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const path = await prisma.learningPath.findUnique({
      where: { id: req.params.id },
      include: {
        steps: {
          include: {
            course: {
              include: { provider: { select: { name: true, displayName: true, logoUrl: true } } },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!path) return next(new AppError('Path not found', 404));
    return res.json({ success: true, data: path });
  } catch (err) {
    return next(err);
  }
});

export default router;
