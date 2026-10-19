import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { ProgressEventSchema } from '../../../shared/src/index';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /progress:
 *   post:
 *     tags: [Progress]
 *     summary: Log a progress event
 */
router.post('/', validate(ProgressEventSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { enrollmentId, eventType, percentComplete, hoursSpent, notes, proofUrl } = req.body;

    const enrollment = await prisma.enrollment.findFirst({
      where: { id: enrollmentId, userId: req.user!.id },
    });
    if (!enrollment) return next(new AppError('Enrollment not found', 404));

    // Create progress event
    const event = await prisma.progressEvent.create({
      data: {
        userId: req.user!.id,
        enrollmentId,
        eventType,
        percentComplete,
        hoursSpent,
        notes,
        proofUrl,
      },
    });

    // Update enrollment status and aggregates
    const updates: any = {};
    if (eventType === 'started') updates.status = 'in_progress';
    if (eventType === 'completed') {
      updates.status = 'completed';
      updates.completedAt = new Date();
      updates.percentComplete = 100;
    } else if (percentComplete !== undefined) {
      updates.percentComplete = percentComplete;
    }
    if (hoursSpent) updates.hoursSpent = { increment: hoursSpent };

    await prisma.enrollment.update({ where: { id: enrollmentId }, data: updates });

    // Update profile total hours and streak
    if (hoursSpent) {
      await prisma.profile.update({
        where: { userId: req.user!.id },
        data: {
          totalHours: { increment: hoursSpent },
          lastActiveDate: new Date(),
        },
      });
    }

    // Auto-issue credential on completion
    if (eventType === 'completed') {
      const course = await prisma.course.findUnique({
        where: { id: enrollment.courseId },
        include: { provider: true },
      });

      if (course?.certificateAvailable) {
        await prisma.credential.upsert({
          where: { enrollmentId },
          create: {
            userId: req.user!.id,
            enrollmentId,
            type: 'certificate',
            title: `Certificate of Completion: ${course.title}`,
            description: `Successfully completed ${course.title} by ${course.provider.displayName}`,
            issuer: 'GSDAP',
          },
          update: {},
        });
      }
    }

    return res.status(201).json({ success: true, data: event });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /progress/dashboard:
 *   get:
 *     tags: [Progress]
 *     summary: Get learner dashboard summary
 */
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [profile, recentEnrollments, totalCompleted, credentials, streakData] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.enrollment.findMany({
        where: { userId, status: { in: ['enrolled', 'in_progress'] } },
        include: {
          course: { include: { provider: { select: { name: true, displayName: true } } } },
          path: { select: { title: true, steps: { select: { courseId: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.enrollment.count({ where: { userId, status: 'completed' } }),
      prisma.credential.count({ where: { userId } }),
      prisma.progressEvent.findMany({
        where: { userId },
        select: { createdAt: true, hoursSpent: true },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        profile,
        recentEnrollments,
        totalCompleted,
        credentials,
        totalHours: profile?.totalHours || 0,
        streakDays: profile?.streakDays || 0,
        recentActivity: streakData,
      },
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
