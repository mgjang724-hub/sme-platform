import { PrismaClient, GlobalRole, CourseStatus, DeliverableType, FeedbackStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LESSON1_V1, LESSON2_V1, LESSON2_V2, LESSON3_V1 } from './fixtures/scripts';
import { writeScriptFiles } from './fixtures/docx';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/** SEED_RESET=true 로 켰을 때만 기존 데이터를 지운다. 실수로 지워지지 않게 값을 명시적으로 본다. */
function isResetRequested(): boolean {
  const raw = String(process.env.SEED_RESET || '').trim().toLowerCase();
  return raw === 'true' || raw === '1' || raw === 'yes';
}

/** 프리즈마가 관리하지 않고 파일로 저장되는 도메인. 지우면 서버가 뜰 때 기본값으로 다시 만든다. */
const JSON_STORES = ['guides.json', 'inbox.json', 'notifications.json', 'calendar_events.json'];

async function clearEverything() {
  // 외래키 때문에 지우는 순서가 중요하다.
  await prisma.decisionLog.deleteMany({});
  await prisma.approval.deleteMany({});
  await prisma.feedbackAttachment.deleteMany({});
  await prisma.feedback.deleteMany({});
  // 산출물이 붙잡고 있는 확정본 참조를 먼저 풀어야 버전을 지울 수 있다.
  await prisma.deliverable.updateMany({ data: { final_file_version_id: null } });
  await prisma.fileVersion.deleteMany({});
  await prisma.deliverable.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.courseMember.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  for (const name of JSON_STORES) {
    const file = path.join(process.cwd(), name);
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`  ${name} 삭제 (서버 시작 시 기본값으로 다시 생성됨)`);
    }
  }
}

async function main() {
  const userCount = await prisma.user.count();
  const reset = isResetRequested();

  if (userCount > 0 && !reset) {
    console.log('이미 데이터가 있어 시딩을 건너뜁니다.');
    console.log('데모 데이터를 새로 채우려면 SEED_RESET=true 로 실행하세요. (기존 데이터는 지워집니다)');
    return;
  }

  if (userCount > 0) {
    console.log(`SEED_RESET=true — 기존 데이터(사용자 ${userCount}명)를 지우고 데모 데이터를 다시 채웁니다.`);
  } else {
    console.log('빈 데이터베이스입니다. 데모 데이터를 채웁니다.');
  }

  await clearEverything();

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

  // Create Course 2
  const course2 = await prisma.course.create({
    data: {
      course_name: '인공지능 활용 수업 설계 입문',
      lesson_count: 3,
      current_stage: '원고',
      status: CourseStatus.ACTIVE,
      planner_id: planner.user_id,
      courseCode: 'CRS-2026-002',
      vendor: 'AX 교육기술연구소',
      dev_type: '신규 개발',
      overview: '생성형 AI를 활용한 교수학습 설계 기초 과정입니다.',
    },
  });

  await prisma.courseMember.create({
    data: {
      course_id: course2.course_id,
      user_id: planner.user_id,
      role_in_course: 'PLANNER',
    },
  });

  await prisma.courseMember.create({
    data: {
      course_id: course2.course_id,
      user_id: sme.user_id,
      role_in_course: 'SME',
      access_scope: JSON.stringify({ lessons: [1, 2, 3] }),
    },
  });

  const lessonData2 = [
    { no: 1, title: '생성형 AI의 이해', code: 'LSN-201' },
    { no: 2, title: '프롬프트 엔지니어링 기초', code: 'LSN-202' },
    { no: 3, title: '수업 적용 사례 분석', code: 'LSN-203' },
  ];

  for (const l of lessonData2) {
    const lesson = await prisma.lesson.create({
      data: {
        course_id: course2.course_id,
        lesson_no: l.no,
        title: l.title,
        derived_status: 'NOT_SUBMITTED',
        lessonCode: l.code,
      },
    });

    await prisma.deliverable.create({
      data: {
        lesson_id: lesson.lesson_id,
        deliverable_type: DeliverableType.SCRIPT,
        owner_role: 'SME',
        current_status: 'NOT_SUBMITTED',
      },
    });
  }

  // ── 시연용 제출 상태 ──────────────────────────────────────
  // 1차시: 최종 승인 완료(잠김)  2차시: 검수 대기 + 미반영 피드백
  // 3차시: 수정 요청            4·5차시: 작성 대기
  // 원고는 실제 docx로 만들어 두어 미리보기와 문장 인용 피드백이 그대로 동작한다.

  const deliverableOf = async (lessonNo: number) =>
    prisma.deliverable.findFirst({
      where: { lesson: { lesson_no: lessonNo, course_id: course.course_id } },
    });

  const submit = async (
    deliverableId: string,
    fixture: { fileName: string; paragraphs: string[] },
    roundNo: number,
    seq: number,
  ) => {
    const { storagePath, previewPath } = writeScriptFiles(
      fixture.fileName,
      fixture.paragraphs,
      roundNo,
      seq,
    );
    return prisma.fileVersion.create({
      data: {
        deliverable_id: deliverableId,
        storage_path: storagePath,
        preview_path: previewPath,
        stage: 'DRAFT',
        round_no: roundNo,
        kind: 'FILE',
        uploaded_by: sme.user_id,
      },
    });
  };

  // ── 1차시: 제출 → 피드백 반영 → 최종 승인 ──
  const d1 = await deliverableOf(1);
  if (d1) {
    const v1 = await submit(d1.deliverable_id, LESSON1_V1, 1, 1);

    await prisma.feedback.createMany({
      data: [
        {
          deliverable_id: d1.deliverable_id,
          file_version_id: v1.version_id,
          location_type: 'QUOTE',
          location_value: '학교자율시간은 빈 시간을 채우는 일이 아니라',
          content: '이 표현이 이번 과정의 핵심 메시지입니다. 정리 부분에서 한 번 더 짚어 주시면 좋겠습니다.',
          assignee_id: sme.user_id,
          created_by: planner.user_id,
          status: FeedbackStatus.RESOLVED,
        },
        {
          deliverable_id: d1.deliverable_id,
          file_version_id: v1.version_id,
          content: '도입 질문이 자연스럽습니다. 이대로 진행해 주세요.',
          assignee_id: sme.user_id,
          created_by: planner.user_id,
          status: FeedbackStatus.RESOLVED,
        },
      ],
    });

    // 기획자가 최종 승인한 상태로 둔다. 이후 업로드는 잠긴다.
    await prisma.approval.create({
      data: {
        file_version_id: v1.version_id,
        approved_by: planner.user_id,
        lock_applied: true,
      },
    });
    await prisma.fileVersion.update({
      where: { version_id: v1.version_id },
      data: { is_final: true },
    });
    await prisma.deliverable.update({
      where: { deliverable_id: d1.deliverable_id },
      data: { current_status: 'APPROVED', final_file_version_id: v1.version_id },
    });
  }

  // ── 2차시: 1차 제출 후 수정본까지 올라온 상태, 검수 대기 ──
  const d2 = await deliverableOf(2);
  if (d2) {
    await submit(d2.deliverable_id, LESSON2_V1, 1, 2);
    const v2 = await submit(d2.deliverable_id, LESSON2_V2, 2, 3);

    await prisma.feedback.createMany({
      data: [
        {
          deliverable_id: d2.deliverable_id,
          file_version_id: v2.version_id,
          location_type: 'QUOTE',
          location_value: '각 교과의 최소 시수는 보장되어야 합니다.',
          content: '최소 시수의 구체적인 수치를 예시로 하나 넣어 주시면 이해가 훨씬 쉬울 것 같습니다.',
          assignee_id: sme.user_id,
          created_by: planner.user_id,
          status: FeedbackStatus.OPEN,
        },
        {
          deliverable_id: d2.deliverable_id,
          file_version_id: v2.version_id,
          location_type: 'QUOTE',
          location_value: '표는 교과와 창의적 체험활동으로 나뉘어 있습니다.',
          content: '앞 버전의 긴 문장을 나눠 주셔서 훨씬 잘 읽힙니다. 반영 확인했습니다.',
          assignee_id: sme.user_id,
          created_by: planner.user_id,
          status: FeedbackStatus.RESOLVED,
        },
      ],
    });

    await prisma.deliverable.update({
      where: { deliverable_id: d2.deliverable_id },
      data: { current_status: 'SUBMITTED' },
    });
  }

  // ── 3차시: 수정 요청을 받은 상태 ──
  const d3 = await deliverableOf(3);
  if (d3) {
    const v1 = await submit(d3.deliverable_id, LESSON3_V1, 1, 4);

    await prisma.feedback.create({
      data: {
        deliverable_id: d3.deliverable_id,
        file_version_id: v1.version_id,
        location_type: 'QUOTE',
        location_value: '평가할 수 없는 성취기준은 실제로는 성취기준이 아닙니다.',
        content: '중요한 문장인데 근거가 없어 단정적으로 읽힙니다. 성취기준-평가 연계 예시를 한 개만 붙여 주세요.',
        assignee_id: sme.user_id,
        created_by: planner.user_id,
        status: FeedbackStatus.OPEN,
      },
    });

    await prisma.deliverable.update({
      where: { deliverable_id: d3.deliverable_id },
      data: { current_status: 'REVISION_REQUESTED' },
    });
  }

  console.log('시연용 제출 상태 구성 완료 (1차시 승인 / 2차시 검수대기 / 3차시 수정요청).');

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
