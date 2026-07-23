const { PrismaClient } = require('./apps/backend/node_modules/@prisma/client'); const prisma = new PrismaClient(); prisma.course.findMany().then(c =
