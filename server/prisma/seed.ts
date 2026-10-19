import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

type CourseData = {
  externalId: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  durationHours: number;
  language: string;
  skills: string[];
  url: string;
  cost: number;
  certificateAvailable: boolean;
  thumbnailUrl: string | null;
  instructor: string;
  rating: number;
  enrollmentCount: number;
};

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ─── Providers ──────────────────────────────────────────────────────────────

  const providers = await Promise.all([
    prisma.provider.upsert({
      where: { name: 'coursera' },
      create: {
        name: 'coursera',
        displayName: 'Coursera',
        website: 'https://www.coursera.org',
        description: 'World-class learning from top universities and companies',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Coursera-Logo_600x600.svg/200px-Coursera-Logo_600x600.svg.png',
        isActive: true,
      },
      update: { displayName: 'Coursera', isActive: true },
    }),
    prisma.provider.upsert({
      where: { name: 'google' },
      create: {
        name: 'google',
        displayName: 'Google',
        website: 'https://grow.google',
        description: 'Grow with Google — professional certificates and digital skills training',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png',
        isActive: true,
      },
      update: { displayName: 'Google', isActive: true },
    }),
    prisma.provider.upsert({
      where: { name: 'microsoft' },
      create: {
        name: 'microsoft',
        displayName: 'Microsoft',
        website: 'https://learn.microsoft.com',
        description: 'Microsoft Learn — official learning for Microsoft technologies and certifications',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png',
        isActive: true,
      },
      update: { displayName: 'Microsoft', isActive: true },
    }),
    prisma.provider.upsert({
      where: { name: 'nvidia' },
      create: {
        name: 'nvidia',
        displayName: 'NVIDIA',
        website: 'https://www.nvidia.com/en-us/training/',
        description: 'NVIDIA Deep Learning Institute — hands-on AI and GPU computing training',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/200px-Nvidia_logo.svg.png',
        isActive: true,
      },
      update: { displayName: 'NVIDIA', isActive: true },
    }),
    prisma.provider.upsert({
      where: { name: 'tvet' },
      create: {
        name: 'tvet',
        displayName: 'TVET',
        website: 'https://onemillioncoders.io/tvet',
        description: 'Technical and Vocational Education and Training — practical skills for the workforce',
        logoUrl: null,
        isActive: true,
      },
      update: { displayName: 'TVET', isActive: true },
    }),
  ]);

  console.log(`✅ Seeded ${providers.length} providers`);

  // ─── TVET Institution ────────────────────────────────────────────────────────

  const institution = await prisma.institution.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Technical and Vocational Education Institute',
      country: 'Kenya',
      region: 'Nairobi',
      website: 'https://tvet.go.ke',
      description: 'Government TVET institute offering practical digital skills programs',
    },
    update: {},
  });

  console.log(`✅ Seeded institution: ${institution.name}`);

  // ─── Courses ─────────────────────────────────────────────────────────────────

  const providerMap = new Map(providers.map((p) => [p.name, p]));
  const courseFiles = [
    { file: 'coursera.json', providerName: 'coursera' },
    { file: 'google.json', providerName: 'google' },
    { file: 'microsoft.json', providerName: 'microsoft' },
    { file: 'nvidia.json', providerName: 'nvidia' },
    { file: 'tvet.json', providerName: 'tvet' },
  ];

  let totalCourses = 0;

  for (const { file, providerName } of courseFiles) {
    const provider = providerMap.get(providerName as any)!;
    const dataPath = path.join(__dirname, '../data', file);
    const courses: CourseData[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    for (const course of courses) {
      await prisma.course.upsert({
        where: {
          providerId_externalId: {
            providerId: provider.id,
            externalId: course.externalId,
          },
        },
        create: {
          externalId: course.externalId,
          providerId: provider.id,
          institutionId: providerName === 'tvet' ? institution.id : null,
          title: course.title,
          description: course.description,
          level: course.level,
          durationHours: course.durationHours,
          language: course.language || 'en',
          skills: course.skills || [],
          url: course.url,
          cost: course.cost || 0,
          certificateAvailable: course.certificateAvailable || false,
          thumbnailUrl: course.thumbnailUrl,
          instructor: course.instructor,
          rating: course.rating,
          enrollmentCount: course.enrollmentCount,
          isFeatured: course.rating >= 4.7,
          isActive: true,
        },
        update: {
          title: course.title,
          rating: course.rating,
          enrollmentCount: course.enrollmentCount,
          isFeatured: course.rating >= 4.7,
        },
      });
      totalCourses++;
    }

    console.log(`  📚 ${providerName}: ${courses.length} courses seeded`);
  }

  console.log(`✅ Seeded ${totalCourses} courses\n`);

  // ─── Users ───────────────────────────────────────────────────────────────────

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@onemillioncoders.io';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@12345';

  const adminHash = await argon2.hash(adminPassword);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      emailVerified: true,
      profile: {
        create: {
          skillLevel: 'advanced',
          goals: ['system_administration'],
          region: 'Global',
          onboardingCompleted: true,
        },
      },
    },
    update: { role: 'super_admin', emailVerified: true },
  });

  console.log(`✅ Admin user: ${admin.email}`);

  // Demo learner
  const learnerHash = await argon2.hash('Learner@123');
  const learner = await prisma.user.upsert({
    where: { email: 'learner@demo.io' },
    create: {
      email: 'learner@demo.io',
      passwordHash: learnerHash,
      firstName: 'Demo',
      lastName: 'Learner',
      role: 'learner',
      emailVerified: true,
      profile: {
        create: {
          skillLevel: 'beginner',
          goals: ['data_science', 'machine_learning'],
          region: 'Sub-Saharan Africa',
          country: 'Nigeria',
          preferredLanguage: 'en',
          onboardingCompleted: true,
          totalHours: 12.5,
          streakDays: 3,
        },
      },
    },
    update: {},
  });

  // Demo mentor
  const mentorHash = await argon2.hash('Mentor@123');
  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@demo.io' },
    create: {
      email: 'mentor@demo.io',
      passwordHash: mentorHash,
      firstName: 'Demo',
      lastName: 'Mentor',
      role: 'mentor',
      emailVerified: true,
      profile: {
        create: {
          skillLevel: 'advanced',
          goals: ['mentoring'],
          region: 'East Africa',
          country: 'Kenya',
          preferredLanguage: 'en',
          onboardingCompleted: true,
          totalHours: 240,
          streakDays: 30,
        },
      },
    },
    update: {},
  });

  console.log(`✅ Demo users: learner@demo.io, mentor@demo.io`);

  // ─── Sample Learning Path ─────────────────────────────────────────────────

  const coursera = providerMap.get('coursera')!;
  const google = providerMap.get('google')!;

  const mlCourse = await prisma.course.findFirst({
    where: { providerId: coursera.id, externalId: 'coursera-ml-andrew-ng' },
  });
  const dataCourse = await prisma.course.findFirst({
    where: { providerId: google.id, externalId: 'google-data-analytics' },
  });

  if (mlCourse && dataCourse) {
    const path = await prisma.learningPath.upsert({
      where: { id: '00000000-0000-0000-0000-000000000010' },
      create: {
        id: '00000000-0000-0000-0000-000000000010',
        title: 'Data Science & ML Starter Path',
        description: 'Go from zero to job-ready in data science and machine learning. Combines the best of Google and Coursera.',
        goal: 'data_science',
        isPublic: true,
        isOfficial: true,
        createdById: admin.id,
        steps: {
          create: [
            { courseId: dataCourse.id, order: 0, required: true, notes: 'Start with data fundamentals before diving into ML' },
            { courseId: mlCourse.id, order: 1, required: true, notes: 'The gold standard in ML education' },
          ],
        },
      },
      update: {},
    });
    console.log(`✅ Sample learning path: "${path.title}"`);
  }

  // ─── Sample Cohort ──────────────────────────────────────────────────────────

  await prisma.cohort.upsert({
    where: { id: '00000000-0000-0000-0000-000000000020' },
    create: {
      id: '00000000-0000-0000-0000-000000000020',
      name: 'Data Science Bootcamp — Q4 2026',
      description: 'Join 100 learners on a structured 12-week data science journey. Mentored cohort.',
      mentorId: mentor.id,
      institutionId: institution.id,
      status: 'active',
      maxMembers: 100,
      inviteCode: 'DATAQ426',
      startDate: new Date('2026-10-15'),
      endDate: new Date('2027-01-15'),
    },
    update: {},
  });

  console.log(`✅ Sample cohort seeded`);

  console.log('\n🎉 Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('  Admin:   admin@onemillioncoders.io / Admin@12345');
  console.log('  Learner: learner@demo.io / Learner@123');
  console.log('  Mentor:  mentor@demo.io / Mentor@123');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
