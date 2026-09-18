import { beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from '../lib/prisma';

beforeAll(async () => {
  // Ensure we are using the test database
  if (!process.env.DATABASE_URL?.includes('test')) {
    throw new Error('Tests must run against a database with "test" in the URL for safety.');
  }
});

afterEach(async () => {
  // Optionally clean up tables after each test
  // await prisma.followUp.deleteMany();
  // await prisma.employer.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
