import { PrismaClient } from "@prisma/client";

const globalWithPrisma = global as typeof globalThis & { prisma: PrismaClient };

if (process.env.NODE_ENV !== "production" && !globalWithPrisma.prisma) {
  globalWithPrisma.prisma = new PrismaClient();
}

const prisma =
  process.env.NODE_ENV === "production"
    ? new PrismaClient()
    : globalWithPrisma.prisma;

export default prisma;
