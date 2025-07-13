import { PrismaClient } from '@prisma/client'

// This setup is the official recommendation from Prisma to prevent
// creating too many connections during development hot-reloads.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // Optional: logs every query to the console
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma