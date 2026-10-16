import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  findUnique: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: { users: { findUnique: m.findUnique } } }));
vi.mock("../resend", () => ({ sendEmail: m.sendEmail }));

import { sendBillingEmail } from "../billing";
import {
  paymentFailedEmail,
  subscriptionActivatedEmail,
  subscriptionCanceledEmail,
  subscriptionReactivatedEmail,
} from "../billing-templates";

const user = { user_email: "ana@example.com", user_name: "Ana" };

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("sendBillingEmail", () => {
  it("manda desde el remitente de billing, no desde el de los códigos", async () => {
    m.findUnique.mockResolvedValue(user);
    await sendBillingEmail("u1", { kind: "activated", nextDate: new Date("2026-11-16T12:00:00Z") });
    const arg = m.sendEmail.mock.calls[0][0];
    expect(arg.to).toBe("ana@example.com");
    expect(arg.from).toContain("billing@decida.mx");
    expect(arg.subject).toMatch(/activa/i);
  });

  it("no hace nada si la cuenta no existe", async () => {
    m.findUnique.mockResolvedValue(null);
    await sendBillingEmail("u1", { kind: "payment_failed" });
    expect(m.sendEmail).not.toHaveBeenCalled();
  });

  it("nunca lanza aunque el envío falle (no debe hacer reintentar el webhook)", async () => {
    m.findUnique.mockResolvedValue(user);
    m.sendEmail.mockRejectedValue(new Error("Resend caído"));
    await expect(
      sendBillingEmail("u1", { kind: "canceled", accessUntil: null }),
    ).resolves.toBeUndefined();
  });
});

describe("plantillas de cobro", () => {
  const appUrl = "https://decida.mx";

  it("activada: incluye la fecha de renovación y el monto", () => {
    const { html } = subscriptionActivatedEmail({
      name: "Ana",
      nextDate: new Date("2026-11-16T12:00:00Z"),
      appUrl,
    });
    expect(html).toContain("16 de noviembre de 2026");
    expect(html).toContain("$99 MXN");
    expect(html).toContain("https://decida.mx/cuenta/suscripcion");
  });

  it("cancelada: dice hasta cuándo conserva el acceso y que no hay más cobros", () => {
    const { subject, html } = subscriptionCanceledEmail({
      name: null,
      accessUntil: new Date("2026-11-03T12:00:00Z"),
      appUrl,
    });
    expect(subject).toMatch(/cancelamos/i);
    expect(html).toContain("3 de noviembre de 2026");
    expect(html).toContain("no se te volverá a cobrar");
  });

  it("reactivada: aclara que no hubo cobro y cuándo se renueva", () => {
    const { subject, html } = subscriptionReactivatedEmail({
      name: "Ana",
      nextDate: new Date("2026-11-16T12:00:00Z"),
      appUrl,
    });
    expect(subject).toMatch(/reactivamos/i);
    expect(html).toContain("No se te cobró ahora");
    expect(html).toContain("16 de noviembre de 2026");
  });

  it("cobro fallido: pide actualizar el método de pago", () => {
    expect(paymentFailedEmail({ name: "Ana", appUrl }).html).toContain("método de pago");
  });

  it("escapa el nombre para no inyectar HTML", () => {
    const { html } = paymentFailedEmail({ name: "<script>x</script>", appUrl });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
