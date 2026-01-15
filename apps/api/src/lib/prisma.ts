import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

console.log('Initializing Prisma client...');
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
console.log('Prisma client set.');

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
