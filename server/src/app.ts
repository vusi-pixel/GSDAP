import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Routes
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import catalogRouter from './routes/catalog';
import pathsRouter from './routes/paths';
import enrollmentsRouter from './routes/enrollments';
import progressRouter from './routes/progress';
import credentialsRouter from './routes/credentials';
import cohortsRouter from './routes/cohorts';
import adminRouter from './routes/admin';

// OpenAPI spec
import { swaggerSpec } from './lib/swagger';

const app = express();

// ─── Security middleware ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate limiting ──────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(limiter);

// ─── Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ────────────────────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

// ─── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── API docs ────────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/auth', authLimiter, authRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);
app.use('/paths', pathsRouter);
app.use('/enrollments', enrollmentsRouter);
app.use('/progress', progressRouter);
app.use('/credentials', credentialsRouter);
app.use('/cohorts', cohortsRouter);
app.use('/admin', adminRouter);

// ─── Errors ─────────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
