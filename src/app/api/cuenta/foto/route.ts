import { getCurrentUser } from "@/lib/auth/session-server";
import { avatarKey, getUserFile } from "@/lib/storage/user-files";

/** Foto de perfil de la persona con sesión. La URL lleva `?v=` con la versión, así que el navegador puede guardarla. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });
  if (!user.user_avatar_version) return new Response(null, { status: 404 });

  const file = await getUserFile(avatarKey(user.user_id));
  if (!file) return new Response(null, { status: 404 });

  return new Response(Buffer.from(file.bytes), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
