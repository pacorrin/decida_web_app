import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ sendEmail: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("../resend", () => ({ sendEmail: m.sendEmail }));

import { sendWelcomeEmail } from "../welcome";
import { welcomeEmail } from "../templates";

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("welcomeEmail", () => {
  it("saluda por nombre, escapa el HTML y enlaza al análisis", () => {
    const { subject, html } = welcomeEmail({ name: "<b>Ana</b>", appUrl: "https://decida.mx" });
    expect(subject).toContain("bienvenida");
    expect(html).toContain("Hola &lt;b&gt;Ana&lt;/b&gt;, tu cuenta está lista");
    expect(html).toContain('href="https://decida.mx/analizar"');
  });

  it("sin nombre no deja un saludo roto", () => {
    expect(welcomeEmail({ name: null, appUrl: "x" }).html).toContain("Tu cuenta está lista");
  });
});

describe("sendWelcomeEmail", () => {
  it("manda el correo a la cuenta", async () => {
    await sendWelcomeEmail({ user_email: "ana@example.com", user_name: "Ana" });
    expect(m.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "ana@example.com", subject: expect.stringContaining("bienvenida") }),
    );
  });

  it("nunca lanza si el envío falla", async () => {
    m.sendEmail.mockRejectedValue(new Error("resend caído"));
    await expect(
      sendWelcomeEmail({ user_email: "ana@example.com", user_name: null }),
    ).resolves.toBeUndefined();
  });
});
