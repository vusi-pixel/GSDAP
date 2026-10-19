import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as authService from '../services/auth.service';
import { generateTokens } from '../services/auth.service';
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@omc/shared';

const router = Router();

// Configure Google strategy if credentials provided
const isGoogleOAuthConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id');

if (isGoogleOAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await authService.googleAuth(profile);
          done(null, user);
        } catch (err) {
          done(err as Error, undefined);
        }
      },
    ),
  );
}

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       201:
 *         description: User created, verification email sent
 *       409:
 *         description: Email already in use
 */
router.post('/register', validate(RegisterSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    await authService.register(email, password, firstName, lastName);
    res.status(201).json({
      success: true,
      message: 'Account created. Please check your email to verify your account.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 */
router.post('/login', validate(LoginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using httpOnly cookie
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token', code: 'UNAUTHORIZED' });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, data: { accessToken: result.accessToken } });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and revoke refresh token
 */
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) await authService.logout(refreshToken);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verify email with token
 */
router.get('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Token required' });
    }
    await authService.verifyEmail(token);
    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    return next(err);
  }
});

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Send password reset email
 */
router.post('/forgot-password', validate(ForgotPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with token
 */
router.post('/reset-password', validate(ResetPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

router.get('/google', (req, res, next) => {
  if (!isGoogleOAuthConfigured) {
    return res.status(501).json({ success: false, message: 'Google OAuth is not configured in this environment.' });
  }
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!isGoogleOAuthConfigured) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_not_configured`);
    }
    return passport.authenticate('google', { session: false, failureRedirect: '/auth/google/failure' })(req, res, next);
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as { id: string; role: string; email: string };
      const { accessToken, refreshToken } = generateTokens(user.id, user.role as Parameters<typeof generateTokens>[1], user.email);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`);
    } catch (err) {
      next(err);
    }
  },
);

router.get('/google/failure', (_req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
});

export default router;
