import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { EnrollSchema } from '../../../shared/src/index';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /enrollments:
 *   get:
 *     tags: [Enrollments]
 *     summary: Get user's enrollments
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user!.id },
      include: {
        course: {
          include: { provider: { select: { name: true, displayName: true, logoUrl: true } } },
        },
        path: { select: { id: true, title: true, goal: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return res.json({ success: true, data: enrollments });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /enrollments:
 *   post:
 *     tags: [Enrollments]
 *     summary: Enroll in a course
 */
router.post('/', validate(EnrollSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId, pathId, cohortId } = req.body;

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return next(new AppError('Course not found', 404));

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: req.user!.id, courseId } },
      create: {
        userId: req.user!.id,
        courseId,
        pathId,
        cohortId,
        status: 'enrolled',
        startedAt: new Date(),
      },
      update: {
        status: 'in_progress',
        pathId: pathId ?? undefined,
        cohortId: cohortId ?? undefined,
      },
      include: {
        course: { include: { provider: true } },
      },
    });

    return res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /enrollments/{id}:
 *   get:
 *     tags: [Enrollments]
 *     summary: Get enrollment detail
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        course: { include: { provider: true } },
        progressEvents: { orderBy: { createdAt: 'asc' } },
        credential: true,
      },
    });
    if (!enrollment) return next(new AppError('Enrollment not found', 404));
    return res.json({ success: true, data: enrollment });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /enrollments/{id}:
 *   delete:
 *     tags: [Enrollments]
 *     summary: Drop a course (status = dropped)
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!enrollment) return next(new AppError('Enrollment not found', 404));

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'dropped' },
    });
    return res.json({ success: true, message: 'Course dropped' });
  } catch (err) {
    return next(err);
  }
});

export default router;
