import { prisma } from "@/lib/prisma";

export async function queryRaw<T = unknown>(
  sql: string,
  ...values: unknown[]
): Promise<T[]> {
  return prisma.$queryRawUnsafe<T[]>(sql, ...values);
}

export async function executeRaw(sql: string, ...values: unknown[]): Promise<number> {
  return prisma.$executeRawUnsafe(sql, ...values);
}

export { prisma };
