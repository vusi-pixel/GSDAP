import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * @openapi
 * /credentials/verify/{code}:
 *   get:
 *     tags: [Credentials]
 *     summary: Public credential verification (no auth)
 */
router.get('/verify/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const credential = await prisma.credential.findUnique({
      where: { verifyCode: req.params.code },
      include: {
        user: { select: { firstName: true, lastName: true } },
        enrollment: {
          include: {
            course: { include: { provider: { select: { displayName: true } } } },
          },
        },
      },
    });

    if (!credential) return next(new AppError('Credential not found or invalid verification code', 404));

    return res.json({
      success: true,
      data: {
        valid: true,
        credential: {
          id: credential.id,
          type: credential.type,
          title: credential.title,
          issuer: credential.issuer,
          issuedAt: credential.issuedAt,
          expiresAt: credential.expiresAt,
          recipient: `${credential.user.firstName} ${credential.user.lastName}`,
          course: credential.enrollment?.course?.title,
          provider: credential.enrollment?.course?.provider?.displayName,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
});

router.use(authenticate);

/**
 * @openapi
 * /credentials:
 *   get:
 *     tags: [Credentials]
 *     summary: Get user's credentials
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const credentials = await prisma.credential.findMany({
      where: { userId: req.user!.id },
      include: {
        enrollment: {
          include: {
            course: {
              include: { provider: { select: { name: true, displayName: true } } },
            },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
    return res.json({ success: true, data: credentials });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /credentials/{id}:
 *   get:
 *     tags: [Credentials]
 *     summary: Get credential detail
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const credential = await prisma.credential.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        enrollment: { include: { course: { include: { provider: true } } } },
      },
    });
    if (!credential) return next(new AppError('Credential not found', 404));
    return res.json({ success: true, data: credential });
  } catch (err) {
    return next(err);
  }
});

export default router;
