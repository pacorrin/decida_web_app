import { describe, expect, it } from "vitest";
import {
  buildFounderProfile,
  buildScoresForAi,
  sanitizeSectionMarkdown,
} from "../report-context";

const deterministic = {
  dimensions: [
    { key: "personal_fit", score: 74, label: "Compatibilidad personal" },
    { key: "risk_level", score: 94, label: "Nivel de riesgo" },
  ],
  metrics: {},
  scoringVersion: "x",
} as never;

const interpretation = {
  personal_fit_signal: "green",
  financial_viability_signal: "green",
  commercial_viability_signal: "yellow",
  risk_level_signal: "red",
  time_fit_signal: "yellow",
  scalability_signal: "yellow",
  final_recommendation: "validate_first",
  red_flags: [],
  reasoning_summary: "",
} as never;

describe("buildScoresForAi", () => {
  it("dice que en «Nivel de riesgo» el puntaje alto es MÁS riesgo y pasa el semáforo", () => {
    const [fit, risk] = buildScoresForAi(deterministic, interpretation);
    expect(risk.lectura).toMatch(/MÁS riesgo/);
    expect(risk.semaforo).toBe("rojo");
    expect(fit.lectura).toMatch(/más favorable/);
    expect(fit.semaforo).toBe("verde");
  });
});

describe("buildFounderProfile", () => {
  it("rotula los datos como de la persona que emprende, con etiquetas legibles", () => {
    const profile = buildFounderProfile({
      assessment_profile: {
        aprf_main_goal: "ingreso_extra",
        aprf_current_situation: "empleado",
        aprf_capital_available_range: "10k_50k",
        aprf_acceptable_loss_range: "5k_20k",
        aprf_hours_per_week_range: "10_20",
      },
      personal_fit_answers: {
        pfit_enjoyed_activities: ["operar", "crear"],
        pfit_work_preference: "mixto",
        pfit_sales_comfort_score: 3,
        pfit_hiring_preference: "algunos",
      },
      financial_inputs: { finp_initial_investment: 18000 },
    } as never);
    expect(profile._nota).toMatch(/NO describen al cliente/);
    expect(profile.objetivo).toBe("Generar ingreso extra");
    expect(profile.actividades_que_disfruta).toEqual([
      "Operar / ejecutar",
      "Crear productos o servicios",
    ]);
    expect(profile.preferencia_de_trabajo).toBe("Mixto");
    expect(profile.contratacion).toBe("Contrataría 1–2 personas");
    expect(profile.inversion_inicial_estimada_mxn).toBe(18000);
  });
});

describe("sanitizeSectionMarkdown", () => {
  it("quita el encabezado inicial repetido", () => {
    expect(
      sanitizeSectionMarkdown("## Resumen Ejecutivo del Diagnóstico\n\nTexto útil."),
    ).toBe("Texto útil.");
  });

  it("quita fórmulas LaTeX en crudo y conserva el texto", () => {
    const out = sanitizeSectionMarkdown(
      "Margen: [ \\text{Margen} = 695 - 385 = 310 ] y sigue.\n\nOtra línea.",
    );
    expect(out).not.toMatch(/\\text|\[ /);
    expect(out).toContain("y sigue.");
    expect(out).toContain("Otra línea.");
  });

  it("cambia «Red Flags» por «Alertas»", () => {
    expect(sanitizeSectionMarkdown("Red Flags a considerar:\n\n- x")).toContain("Alertas a considerar");
    expect(sanitizeSectionMarkdown("hay red flags")).toBe("hay alertas");
  });

  it("deja intacto un texto limpio", () => {
    const clean = "Tienes **buen encaje**.\n\n- uno\n- dos";
    expect(sanitizeSectionMarkdown(clean)).toBe(clean);
  });
});
