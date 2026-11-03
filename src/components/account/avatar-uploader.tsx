"use client";

import { useRef, useState, useTransition } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { removeAvatar, saveAvatar } from "@/app/cuenta/(dashboard)/perfil/actions";

const SIZE = 320;
const MAX_INPUT_BYTES = 12 * 1024 * 1024;

/** Recorta al centro en cuadrado y reduce, para que la foto pese pocos KB sea cual sea la original. */
async function squareBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();
  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  return (await toBlob("image/webp", 0.85)) ?? (await toBlob("image/jpeg", 0.85)) ?? Promise.reject(new Error("blob"));
}

export function AvatarUploader({ src, initials }: { src: string | null; initials: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const shown = preview ?? src;

  function pick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return void toast.error("Elige una imagen JPG, PNG o WebP.");
    if (file.size > MAX_INPUT_BYTES) return void toast.error("La imagen es demasiado pesada.");
    startTransition(async () => {
      const id = toast.loading("Subiendo tu foto…");
      try {
        const blob = await squareBlob(file);
        const body = new FormData();
        body.set("avatar", new File([blob], "foto", { type: blob.type }));
        const result = await saveAvatar(body);
        if (result.success) {
          setPreview(URL.createObjectURL(blob));
          toast.success("Foto actualizada.", { id });
        } else {
          toast.error(result.message ?? "No se pudo subir la foto.", { id });
        }
      } catch {
        toast.error("No pudimos leer esa imagen. Prueba con otra.", { id });
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await removeAvatar();
      if (result.success) {
        setPreview(null);
        toast.success("Foto eliminada.");
      } else {
        toast.error(result.message ?? "No se pudo quitar la foto.");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:items-start">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={pending}
        aria-label={shown ? "Cambiar foto de perfil" : "Subir foto de perfil"}
        className="group relative size-28 shrink-0 overflow-hidden rounded-full bg-white/10 text-4xl font-semibold tracking-tight text-white outline-none transition-transform focus-visible:ring-3 focus-visible:ring-white/60 active:scale-[0.97] disabled:opacity-70 sm:size-32 lg:size-40"
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- foto propia servida con sesión, ya reducida a 320 px
          <img src={shown} alt="" className="size-full object-cover" />
        ) : (
          <span aria-hidden>{initials}</span>
        )}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/45 py-1.5 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:opacity-100">
          <Camera className="size-3.5" aria-hidden />
          {shown ? "Cambiar" : "Subir"}
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {shown && (
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="text-sm font-medium text-white/85 underline-offset-4 hover:text-white hover:underline disabled:opacity-60"
        >
          Quitar foto
        </button>
      )}
    </div>
  );
}
