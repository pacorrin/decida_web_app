import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let dir: string;

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "decida-files-"));
  process.env.USER_FILES_LOCAL_DIR = dir;
  for (const k of ["S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"]) delete process.env[k];
});

afterAll(async () => {
  delete process.env.USER_FILES_LOCAL_DIR;
  await rm(dir, { recursive: true, force: true });
});

describe("archivos de usuario (disco local)", () => {
  it("guarda, lee, reemplaza y borra un archivo", async () => {
    const { avatarKey, deleteUserFile, getUserFile, putUserFile } = await import("../user-files");
    const key = avatarKey("user_1");

    expect(await getUserFile(key)).toBeNull();

    await putUserFile(key, new Uint8Array([1, 2, 3]), "image/webp");
    const first = await getUserFile(key);
    expect(first?.contentType).toBe("image/webp");
    expect(Array.from(first!.bytes)).toEqual([1, 2, 3]);

    await putUserFile(key, new Uint8Array([9]), "image/png");
    const second = await getUserFile(key);
    expect(second?.contentType).toBe("image/png");
    expect(Array.from(second!.bytes)).toEqual([9]);

    await deleteUserFile(key);
    expect(await getUserFile(key)).toBeNull();
  });

  it("rechaza claves que se salen de su carpeta", async () => {
    const { getUserFile } = await import("../user-files");
    await expect(getUserFile("../secreto")).rejects.toThrow();
    await expect(getUserFile("/etc/passwd")).rejects.toThrow();
  });
});
