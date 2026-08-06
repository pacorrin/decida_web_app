import "server-only";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "./password";
import { normalizeEmail } from "./verification";

export async function findUserByEmail(email: string) {
  return prisma.users.findUnique({
    where: { user_email: normalizeEmail(email) },
  });
}

export async function createUser(input: {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}) {
  const passwordHash = await hashPassword(input.password);
  return prisma.users.create({
    data: {
      user_email: normalizeEmail(input.email),
      user_password_hash: passwordHash,
      user_name: input.name,
      user_phone: input.phone,
    },
  });
}

export async function markEmailVerified(userId: string) {
  return prisma.users.update({
    where: { user_id: userId },
    data: { user_email_verified_at: new Date() },
  });
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  return prisma.users.update({
    where: { user_id: userId },
    data: { user_password_hash: passwordHash },
  });
}
