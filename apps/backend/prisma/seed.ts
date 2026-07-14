import { PrismaClient, GlobalRole, CourseStatus, DeliverableType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.decisionLog.deleteMany({});
  await prisma.approval.deleteMany({});
  await prisma.feedbackAttachment.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.fileVersion.deleteMany({});
  await prisma.deliverable.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.courseMember.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  const passwordHash = await bcrypt.hash('test1234', 10);

  const planner = await prisma.user.create({
    data: {
      name: '김기획 기획자',
      email: 'planner@test.com',
      password_hash: passwordHash,
      global_role: GlobalRole.PLANNER,
      status: 'ACTIVE',
    },
  });

  const pm = await prisma.user.create({
    data: {
      name: '이피엠 PM',
      email: 'pm@test.com',
      password_hash: passwordHash,
      global_role: GlobalRole.PM,
      status: 'ACTIVE',
    },
  });

  const sme = await prisma.user.create({
    data: {
      name: '홍길동 강사',
      email: 'sme@test.com',
      password_hash: passwordHash,
      global_role: GlobalRole.SME,
      status: 'ACTIVE',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: '최관리 어드민',
      email: 'admin@test.com',
      password_hash: passwordHash,
      global_role: GlobalRole.ADMIN,
      status: 'ACTIVE',
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: '박매니저 매니저',
      email: 'manager@test.com',
      password_hash: passwordHash,
      global_role: GlobalRole.MANAGER,
      status: 'ACTIVE',
    },
  });

  console.log('Users created: planner, pm, sme, admin, manager');

  // 2. Create Course
  const course = await prisma.course.create({
    data: {
      course_name: '학교자율시간 교육과정 개발 실무',
      lesson_count: 5,
      current_stage: '원고',
      status: CourseStatus.ACTIVE,
      planner_id: planner.user_id,
      courseCode: 'CRS-2026-001',
      vendor: 'AX 교육기술연구소',
      dev_type: '신규 개발',
      overview: '2022 개정 교육과정에 따른 학교자율시간 설계의 실제와 실무 가이드라인을 다루는 핵심 강사 연수 과정입니다.',
      milestones: {
        plan: { start: '2026-07-01', end: '2026-07-10' },
        script: { start: '2026-07-11', end: '2026-07-25' },
        production: { start: '2026-07-26', end: '2026-08-10' },
        review: { start: '2026-08-11', end: '2026-08-20' },
      },
    },
  });

  console.log('Course created:', course.course_name);

  // 3. Create Course Members
  await prisma.courseMember.create({
    data: {
      course_id: course.course_id,
      user_id: planner.user_id,
      role_in_course: 'PLANNER',
    },
  });

  await prisma.courseMember.create({
    data: {
      course_id: course.course_id,
      user_id: pm.user_id,
      role_in_course: 'PM',
    },
  });

  await prisma.courseMember.create({
    data: {
      course_id: course.course_id,
      user_id: sme.user_id,
      role_in_course: 'SME',
      access_scope: JSON.stringify({ lessons: [1, 2, 3, 4, 5] }),
    },
  });

  console.log('Course members associated.');

  // 4. Create Lessons & Deliverables
  const lessonData = [
    { no: 1, title: '학교자율시간의 이해', code: 'LSN-001' },
    { no: 2, title: '교육과정 편성 지침 분석', code: 'LSN-002' },
    { no: 3, title: '과목 개설 및 성취기준 개발', code: 'LSN-003' },
    { no: 4, title: '평가 계획 및 교수학습 설계', code: 'LSN-004' },
    { no: 5, title: '자율시간 운영 및 교육공동체 협의', code: 'LSN-005' },
  ];

  for (const l of lessonData) {
    const lesson = await prisma.lesson.create({
      data: {
        course_id: course.course_id,
        lesson_no: l.no,
        title: l.title,
        derived_status: 'NOT_SUBMITTED',
        lessonCode: l.code,
      },
    });

    // Create SCRIPT deliverable slot for each lesson
    await prisma.deliverable.create({
      data: {
        lesson_id: lesson.lesson_id,
        deliverable_type: DeliverableType.SCRIPT,
        owner_role: 'SME',
        current_status: 'NOT_SUBMITTED',
      },
    });
  }

  console.log('5 Lessons & Deliverables initialized.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
