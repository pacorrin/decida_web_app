"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { addTransaction } from "@/app/cuenta/(dashboard)/cifra/actions";
import { grantCifraAiConsent, smartCapture } from "@/app/cuenta/(dashboard)/cifra/capture-actions";
import { CAPTURE_LIMITS } from "@/lib/cifra/capture/input";
import type { CaptureProposal } from "@/lib/cifra/capture/result";
import { categoriesFor, type CifraFlow } from "@/lib/cifra/constants";
import { CREDITS_PLANS_PATH } from "@/lib/credits/paths";
import { cn } from "@/lib/utils";
import { NativeSelect } from "./form-kit";
import { MoneyInput } from "./inputs";

type Step = "consent" | "input" | "processing" | "review";
type Photo = { file: File; url: string };

const MAX_SIDE = 1280;

/** Reduce la foto en el teléfono antes de subirla: sube más rápido y cuesta menos leerla. */
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
  if (!blob) throw new Error("No se pudo reducir la imagen");
  return new File([blob], "captura.jpg", { type: "image/jpeg" });
}

/**
 * Captura inteligente: fotos y/o texto → la IA propone un ingreso o egreso → la persona confirma.
 * Nada se guarda hasta confirmar. Cada captura cuesta créditos, se use texto, dictado o fotos.
 */
export function SmartCapture({
  consented,
  credits,
  cost,
  today,
}: {
  consented: boolean;
  credits: number;
  cost: number;
  today: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(consented ? "input" : "consent");
  const [hasConsent, setHasConsent] = useState(consented);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [text, setText] = useState("");
  const [proposal, setProposal] = useState<CaptureProposal | null>(null);
  const [flow, setFlow] = useState<CifraFlow>("expense");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [noCredits, setNoCredits] = useState(credits < cost);
  const [left, setLeft] = useState(credits);
  const [pending, startTransition] = useTransition();
  // Una clave por intento: si la petición se repite, el cobro no se duplica.
  const captureId = useRef("");
  const photosRef = useRef<Photo[]>([]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  function reset() {
    photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setText("");
    setProposal(null);
    setErrors({});
    setMessage(null);
    setStep(hasConsent ? "input" : "consent");
    captureId.current = "";
  }

  async function addFiles(list: FileList | null) {
    if (!list) return;
    const room = CAPTURE_LIMITS.maxImages - photos.length;
    if (list.length > room) toast.error(`Puedes subir hasta ${CAPTURE_LIMITS.maxImages} fotos.`);
    const added: Photo[] = [];
    for (const file of Array.from(list).slice(0, Math.max(0, room))) {
      try {
        const small = await shrink(file);
        added.push({ file: small, url: URL.createObjectURL(small) });
      } catch {
        toast.error("No pudimos leer una de las fotos. Prueba con otra.");
      }
    }
    setPhotos((p) => [...p, ...added]);
  }

  function removePhoto(i: number) {
    setPhotos((p) => {
      URL.revokeObjectURL(p[i].url);
      return p.filter((_, idx) => idx !== i);
    });
  }

  function accept() {
    startTransition(async () => {
      const r = await grantCifraAiConsent();
      if (r.success) {
        setHasConsent(true);
        setStep("input");
      } else toast.error(r.message ?? "No pudimos guardar tu autorización.");
    });
  }

  function process() {
    const data = new FormData();
    captureId.current ||= crypto.randomUUID();
    data.set("captureId", captureId.current);
    data.set("text", text);
    photos.forEach((p) => data.append("images", p.file));
    setMessage(null);
    setStep("processing");
    startTransition(async () => {
      try {
        const r = await smartCapture(data);
        if (r.success) {
          setProposal(r.proposal);
          setFlow(r.proposal.flow);
          setLeft(r.creditsLeft);
          setNoCredits(r.creditsLeft < cost);
          setStep("review");
        } else {
          if (r.insufficientCredits) setNoCredits(true);
          setMessage(r.message);
          setStep(r.needsConsent ? "consent" : "input");
          // Una captura nueva de verdad (otra clave) por si el fallo ya se reembolsó.
          captureId.current = "";
        }
      } catch {
        setMessage("Algo salió mal. Intenta de nuevo; si se cobró, se te devolverá.");
        setStep("input");
        captureId.current = "";
      }
    });
  }

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.set("flow", flow);
    startTransition(async () => {
      try {
        const r = await addTransaction(data);
        if (r.success) {
          toast.success(flow === "income" ? "Ingreso registrado" : "Egreso registrado");
          setOpen(false);
          reset();
        } else {
          setErrors(r.fieldErrors ?? {});
          setMessage(r.message ?? "No pudimos guardar el movimiento.");
        }
      } catch {
        setMessage("Algo salió mal. Intenta de nuevo.");
      }
    });
  }

  const err = (name: string) => errors[name]?.[0];
  const canProcess = (photos.length > 0 || text.trim().length > 0) && !noCredits && !pending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={<Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="cifra-smart-capture" />}
      >
        <Sparkles aria-hidden />
        Captura inteligente
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogTitle>Captura inteligente</DialogTitle>

        {step === "consent" && (
          <div className="space-y-4" data-testid="cifra-capture-consent">
            <DialogDescription>
              Para leer tus fotos y tu texto los enviamos a un servicio de inteligencia artificial (OpenAI). Lo hacemos
              solo para esta captura:
            </DialogDescription>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Las fotos no se guardan: se procesan y se descartan.</li>
              <li>Un ticket puede traer datos personales (nombre, últimos dígitos de tu tarjeta). Tápalos si prefieres.</li>
              <li>Nada se registra hasta que tú lo confirmes.</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Más detalle en el{" "}
              <Link href="/privacidad" target="_blank" className="underline underline-offset-4">
                aviso de privacidad
              </Link>
              . Puedes registrar tus movimientos a mano sin usar esta función.
            </p>
            <Button onClick={accept} disabled={pending} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
              {pending && <Loader2 className="animate-spin" aria-hidden />}
              Entiendo y acepto
            </Button>
          </div>
        )}

        {step === "input" && (
          <div className="space-y-4">
            <DialogDescription>
              Sube la foto de un ticket o comprobante, o cuéntanos qué pasó. Lo registramos como ingreso o egreso.
            </DialogDescription>

            <div className="flex flex-wrap gap-2">
              <label className={cn("inline-flex", photos.length >= CAPTURE_LIMITS.maxImages && "pointer-events-none opacity-50")}>
                <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { void addFiles(e.target.files); e.target.value = ""; }} data-testid="cifra-capture-camera" />
                <span className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
                  <Camera className="size-4" aria-hidden /> Tomar foto
                </span>
              </label>
              <label className={cn("inline-flex", photos.length >= CAPTURE_LIMITS.maxImages && "pointer-events-none opacity-50")}>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { void addFiles(e.target.files); e.target.value = ""; }} data-testid="cifra-capture-gallery" />
                <span className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
                  <ImagePlus className="size-4" aria-hidden /> Elegir de la galería
                </span>
              </label>
            </div>

            {photos.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {photos.map((p, i) => (
                  <li key={p.url} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={`Foto ${i + 1}`} className="size-20 rounded-lg border border-border object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      aria-label={`Quitar foto ${i + 1}`}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-foreground p-0.5 text-background"
                    >
                      <X className="size-3" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Field>
              <FieldLabel htmlFor="capture-text">Observaciones (opcional)</FieldLabel>
              <textarea
                id="capture-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                maxLength={CAPTURE_LIMITS.maxTextLength}
                placeholder="Ej. Compré el súper de la semana con tarjeta de débito"
                className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                data-testid="cifra-capture-text"
              />
              <FieldDescription>Puedes dictarlo con el micrófono de tu teclado.</FieldDescription>
            </Field>

            {message && (
              <p role="alert" className="text-sm text-destructive">
                {message}
              </p>
            )}

            {noCredits ? (
              <p className="rounded-xl bg-muted/40 px-3 py-2 text-sm" data-testid="cifra-capture-no-credits">
                Necesitas {cost} créditos para una captura inteligente y te quedan {left}.{" "}
                <Link href={CREDITS_PLANS_PATH} className="font-medium text-primary underline underline-offset-4">
                  Ver planes
                </Link>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Cuesta {cost} créditos por captura, sin importar si usas fotos, texto o ambos. Te quedan {left}. Registrar a mano no
                cuesta nada.
              </p>
            )}

            <Button onClick={process} disabled={!canProcess} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="cifra-capture-process">
              <Sparkles aria-hidden />
              Procesar
            </Button>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground" role="status">
            <Loader2 className="size-6 animate-spin" aria-hidden />
            <p>Leyendo tu captura…</p>
          </div>
        )}

        {step === "review" && proposal && (
          <form onSubmit={save} noValidate className="space-y-4" data-testid="cifra-capture-review">
            <DialogDescription>Revisa lo que entendimos. Puedes corregir lo que quieras antes de guardar.</DialogDescription>

            {proposal.confidence === "low" && (
              <p className="rounded-xl bg-secondary/15 px-3 py-2 text-sm">No estamos muy seguros de esta lectura; revísala con cuidado.</p>
            )}
            {proposal.warnings.map((w) => (
              <p key={w} className="rounded-xl bg-muted/40 px-3 py-2 text-sm">
                {w}
              </p>
            ))}

            <div role="group" aria-label="Tipo de movimiento" className="inline-flex rounded-lg border border-border p-0.5">
              {(["expense", "income"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={flow === f}
                  onClick={() => setFlow(f)}
                  className={cn(
                    "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                    flow === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f === "expense" ? "Egreso" : "Ingreso"}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field data-invalid={err("amount") ? true : undefined}>
                <FieldLabel htmlFor="amount">Monto</FieldLabel>
                <MoneyInput id="amount" name="amount" defaultValue={proposal.amount} invalid={!!err("amount")} />
                {err("amount") && <FieldError>{err("amount")}</FieldError>}
              </Field>
              <Field data-invalid={err("category") ? true : undefined}>
                <FieldLabel htmlFor="category">Categoría</FieldLabel>
                <NativeSelect
                  key={flow}
                  name="category"
                  options={categoriesFor(flow)}
                  defaultValue={categoriesFor(flow).some((c) => c.code === proposal.category) ? proposal.category : undefined}
                />
                {err("category") && <FieldError>{err("category")}</FieldError>}
              </Field>
              <Field data-invalid={err("date") ? true : undefined}>
                <FieldLabel htmlFor="date">Fecha</FieldLabel>
                <Input id="date" name="date" type="date" defaultValue={proposal.date || today} aria-invalid={!!err("date")} />
                {err("date") && <FieldError>{err("date")}</FieldError>}
              </Field>
              <Field data-invalid={err("description") ? true : undefined}>
                <FieldLabel htmlFor="description">Nota (opcional)</FieldLabel>
                <Input id="description" name="description" maxLength={120} defaultValue={proposal.description} />
                {err("description") && <FieldError>{err("description")}</FieldError>}
              </Field>
            </div>

            {message && (
              <p role="alert" className="text-sm text-destructive">
                {message}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={() => { setStep("input"); setMessage(null); captureId.current = ""; }}>
                Volver
              </Button>
              <Button type="submit" disabled={pending} className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="cifra-capture-save">
                {pending && <Loader2 className="animate-spin" aria-hidden />}
                Confirmar y guardar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Si cierras sin guardar, la lectura se pierde y los créditos no se devuelven.</p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
