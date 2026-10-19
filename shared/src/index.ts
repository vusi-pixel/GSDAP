import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const RoleEnum = z.enum(['learner', 'mentor', 'tvet_admin', 'super_admin']);
export type Role = z.infer<typeof RoleEnum>;

export const SkillLevelEnum = z.enum(['beginner', 'intermediate', 'advanced']);
export type SkillLevel = z.infer<typeof SkillLevelEnum>;

export const ProviderNameEnum = z.enum(['coursera', 'google', 'microsoft', 'nvidia', 'tvet']);
export type ProviderName = z.infer<typeof ProviderNameEnum>;

export const CourseLevelEnum = z.enum(['beginner', 'intermediate', 'advanced', 'all_levels']);
export type CourseLevel = z.infer<typeof CourseLevelEnum>;

export const EnrollmentStatusEnum = z.enum(['enrolled', 'in_progress', 'completed', 'dropped']);
export type EnrollmentStatus = z.infer<typeof EnrollmentStatusEnum>;

export const CredentialTypeEnum = z.enum(['badge', 'certificate']);
export type CredentialType = z.infer<typeof CredentialTypeEnum>;

export const CohortStatusEnum = z.enum(['active', 'completed', 'archived']);
export type CohortStatus = z.infer<typeof CohortStatusEnum>;

export const SyncStatusEnum = z.enum(['pending', 'running', 'success', 'failed']);
export type SyncStatus = z.infer<typeof SyncStatusEnum>;

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// ─── Profile Schemas ──────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  region: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  skillLevel: SkillLevelEnum.optional(),
  goals: z.array(z.string()).max(10).optional(),
  preferredLanguage: z.string().max(10).optional(),
  dataSaverMode: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const OnboardingSchema = z.object({
  skillLevel: SkillLevelEnum,
  goals: z.array(z.string()).min(1, 'Select at least one goal').max(5),
  region: z.string().min(1, 'Region is required'),
  country: z.string().optional(),
  preferredLanguage: z.string().default('en'),
  dataSaverMode: z.boolean().default(false),
});
export type OnboardingInput = z.infer<typeof OnboardingSchema>;

// ─── Course / Catalog Schemas ─────────────────────────────────────────────────

export const CatalogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  provider: z.array(ProviderNameEnum).or(ProviderNameEnum).optional(),
  level: CourseLevelEnum.optional(),
  language: z.string().max(10).optional(),
  free: z.coerce.boolean().optional(),
  certificate: z.coerce.boolean().optional(),
  skill: z.string().max(100).optional(),
  sortBy: z.enum(['title', 'duration', 'createdAt', 'popularity']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type CatalogQuery = z.infer<typeof CatalogQuerySchema>;

export const NormalizedCourseSchema = z.object({
  externalId: z.string(),
  providerId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  level: CourseLevelEnum,
  durationHours: z.number().optional(),
  language: z.string().default('en'),
  skills: z.array(z.string()),
  url: z.string().url(),
  cost: z.number().min(0).default(0),
  certificateAvailable: z.boolean().default(false),
  thumbnailUrl: z.string().url().optional().nullable(),
  instructor: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  enrollmentCount: z.number().min(0).optional(),
});
export type NormalizedCourse = z.infer<typeof NormalizedCourseSchema>;

// ─── Path / Roadmap Schemas ───────────────────────────────────────────────────

export const CreatePathSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  goal: z.string().min(1).max(200),
  steps: z
    .array(
      z.object({
        courseId: z.string().uuid(),
        order: z.number().int().min(0),
        required: z.boolean().default(true),
        notes: z.string().max(500).optional(),
      }),
    )
    .min(1),
});
export type CreatePathInput = z.infer<typeof CreatePathSchema>;

// ─── Enrollment Schemas ───────────────────────────────────────────────────────

export const EnrollSchema = z.object({
  courseId: z.string().uuid(),
  pathId: z.string().uuid().optional(),
  cohortId: z.string().uuid().optional(),
});
export type EnrollInput = z.infer<typeof EnrollSchema>;

export const ProgressEventSchema = z.object({
  enrollmentId: z.string().uuid(),
  eventType: z.enum(['started', 'progress', 'completed']),
  percentComplete: z.coerce.number().int().min(0).max(100).optional(),
  hoursSpent: z.coerce.number().min(0).optional(),
  notes: z.string().max(500).optional(),
  proofUrl: z.string().url().optional(),
});
export type ProgressEventInput = z.infer<typeof ProgressEventSchema>;

// ─── Cohort Schemas ───────────────────────────────────────────────────────────

export const CreateCohortSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  pathId: z.string().uuid().optional(),
  institutionId: z.string().uuid().optional(),
  maxMembers: z.coerce.number().int().min(2).max(10000).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
export type CreateCohortInput = z.infer<typeof CreateCohortSchema>;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ─── User Types ───────────────────────────────────────────────────────────────

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
  profile?: PublicProfile;
}

export interface PublicProfile {
  id: string;
  avatarUrl: string | null;
  bio: string | null;
  region: string | null;
  country: string | null;
  skillLevel: SkillLevel | null;
  goals: string[];
  preferredLanguage: string;
  dataSaverMode: boolean;
  notificationsEnabled: boolean;
  totalHours: number;
  streakDays: number;
  onboardingCompleted: boolean;
}
