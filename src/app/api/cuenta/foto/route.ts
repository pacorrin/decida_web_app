import { getCurrentUser } from "@/lib/auth/session-server";
import { prisma } from "@/lib/prisma";

/** Foto de perfil de la persona con sesión. La URL lleva `?v=` con la versión, así que el navegador puede guardarla. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });

  const avatar = await prisma.user_avatars.findUnique({ where: { uavatar_user_id: user.user_id } });
  if (!avatar) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(avatar.uavatar_data), {
    headers: {
      "Content-Type": avatar.uavatar_mime,
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
