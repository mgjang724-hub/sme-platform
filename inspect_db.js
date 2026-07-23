const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany();
  console.log('Courses in DB:', JSON.stringify(courses, null, 2));
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
