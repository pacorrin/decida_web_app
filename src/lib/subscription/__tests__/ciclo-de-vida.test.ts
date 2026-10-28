import { describe, expect, it } from "vitest";
import { hasFullAccess } from "../access";
import { buildSimulatedActivation, shouldActivate } from "../activate";
import { describeSubscription, planCancellation } from "../cancel";
import { decideAssessmentStart } from "../limits";

/**
 * Integración de las reglas puras a lo largo del tiempo.
 * El acceso a nuevas evaluaciones lo deciden los créditos; la suscripción
 * (código legacy) sigue midiendo hasFullAccess para su propio ciclo.
 */
const T0 = new Date("2026-10-01T12:00:00.000Z");
const dias = (n: number) => new Date(T0.getTime() + n * 24 * 3600 * 1000);

describe("ciclo de vida de la suscripción", () => {
  const free = {
    user_subscription_status: "none" as const,
    user_subscription_period_end: null,
    user_subscription_canceled_at: null,
  };

  it("cuenta gratis sin créditos: una sola evaluación", () => {
    expect(hasFullAccess(free, T0)).toBe(false);
    expect(
      decideAssessmentStart({
        creditsBalance: 0,
        latest: { completed: true },
      }),
    ).toBe("limit");
  });

  it("con créditos se puede crear otra evaluación (independiente de la suscripción)", () => {
    expect(
      decideAssessmentStart({
        creditsBalance: 150,
        latest: { completed: true },
      }),
    ).toBe("create");
  });

  it("al suscribirse (legacy) hasFullAccess pasa a true", () => {
    expect(shouldActivate(free, T0)).toBe(true);
    const sub = { ...free, ...buildSimulatedActivation("u1", "explora", T0) };
    expect(hasFullAccess(sub, T0)).toBe(true);
  });

  it("cancelar no quita acceso de suscripción hasta el fin del periodo", () => {
    const activa = { ...free, ...buildSimulatedActivation("u1", "explora", T0) };
    const res = planCancellation(activa, dias(5));
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const cancelada = { ...activa, ...res.data };
    expect(cancelada.user_subscription_period_end).toEqual(activa.user_subscription_period_end);
    expect(hasFullAccess(cancelada, dias(6))).toBe(true);
    expect(describeSubscription(cancelada, dias(6)).kind).toBe("canceled");

    const despues = new Date(activa.user_subscription_period_end.getTime() + 24 * 3600 * 1000);
    expect(hasFullAccess(cancelada, despues)).toBe(false);
    expect(describeSubscription(cancelada, despues).kind).toBe("expired");
    expect(
      decideAssessmentStart({
        creditsBalance: 0,
        latest: { completed: true },
      }),
    ).toBe("limit");
  });

  it("se puede volver a suscribir después de vencida la cancelación, pero no mientras sigue vigente", () => {
    const activa = { ...free, ...buildSimulatedActivation("u1", "explora", T0) };
    const cancelada = { ...activa, user_subscription_status: "canceled" as const, user_subscription_canceled_at: dias(2) };
    expect(shouldActivate(activa, dias(3))).toBe(false);
    expect(shouldActivate(cancelada, dias(3))).toBe(true);
    const resub = { ...cancelada, ...buildSimulatedActivation("u1", "explora", dias(40)) };
    expect(resub.user_subscription_canceled_at).toBeNull();
    expect(hasFullAccess(resub, dias(41))).toBe(true);
  });

  it("una cuenta que nunca se suscribió no puede cancelar", () => {
    expect(planCancellation(free, T0)).toEqual({ ok: false, reason: "no_subscription" });
  });
});
