import "server-only";

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/**
 * Archivos de las personas usuarias (fotos de perfil hoy, PDF generados mañana) en el bucket
 * «decida-user-files» de Railway, que habla S3. El bucket es privado: los archivos se sirven
 * desde rutas de la app que comprueban la sesión.
 *
 * Sin las variables S3_* (desarrollo local) se guarda en disco, en `.data/user-files`.
 * En producción esas variables son obligatorias.
 */

export type StoredFile = { bytes: Uint8Array; contentType: string };

type Backend = {
  put(key: string, bytes: Uint8Array, contentType: string): Promise<void>;
  get(key: string): Promise<StoredFile | null>;
  remove(key: string): Promise<void>;
};

/** Las claves las arma el servidor, pero se rechaza cualquier cosa que pueda salirse de su carpeta. */
function assertSafeKey(key: string) {
  if (!/^[a-z0-9][a-z0-9/_.-]*$/i.test(key) || key.includes("..")) throw new Error("Clave de archivo no válida");
}

function s3Backend(): Backend | null {
  const { S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;
  if (!S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) return null;

  const client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION || "auto",
    credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
  });

  return {
    async put(key, bytes, contentType) {
      await client.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: bytes, ContentType: contentType }));
    },
    async get(key) {
      try {
        const res = await client.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
        if (!res.Body) return null;
        return { bytes: await res.Body.transformToByteArray(), contentType: res.ContentType ?? "application/octet-stream" };
      } catch (err) {
        if ((err as { name?: string }).name === "NoSuchKey") return null;
        throw err;
      }
    },
    async remove(key) {
      await client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    },
  };
}

function diskBackend(): Backend {
  const root = process.env.USER_FILES_LOCAL_DIR ?? path.join(process.cwd(), ".data", "user-files");
  const fileOf = (key: string) => path.join(root, key);
  return {
    async put(key, bytes, contentType) {
      await mkdir(path.dirname(fileOf(key)), { recursive: true });
      await writeFile(fileOf(key), bytes);
      await writeFile(`${fileOf(key)}.type`, contentType);
    },
    async get(key) {
      try {
        const [bytes, type] = await Promise.all([readFile(fileOf(key)), readFile(`${fileOf(key)}.type`, "utf8")]);
        return { bytes, contentType: type };
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw err;
      }
    },
    async remove(key) {
      await rm(fileOf(key), { force: true });
      await rm(`${fileOf(key)}.type`, { force: true });
    },
  };
}

let backend: Backend | undefined;
function storage(): Backend {
  if (backend) return backend;
  const s3 = s3Backend();
  if (!s3 && process.env.NODE_ENV === "production") {
    throw new Error("Faltan las variables S3_* del bucket de archivos de usuario");
  }
  backend = s3 ?? diskBackend();
  return backend;
}

export async function putUserFile(key: string, bytes: Uint8Array, contentType: string) {
  assertSafeKey(key);
  await storage().put(key, bytes, contentType);
}

export async function getUserFile(key: string): Promise<StoredFile | null> {
  assertSafeKey(key);
  return storage().get(key);
}

export async function deleteUserFile(key: string) {
  assertSafeKey(key);
  await storage().remove(key);
}

/** Dónde vive la foto de perfil de cada persona. Un solo objeto por persona: subir otra lo reemplaza. */
export function avatarKey(userId: string): string {
  return `avatars/${userId}`;
}
