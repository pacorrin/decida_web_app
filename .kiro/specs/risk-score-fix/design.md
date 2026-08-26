# Risk Score Fix — Bugfix Design

## Overview

El bugfix corrige cinco defectos relacionados entre sí que anulan la utilidad diagnóstica de las dimensiones `risk_level` y `personal_fit` en `calculateDeterministicScores`.

El problema raíz es una cadena de omisiones: dos campos del perfil de riesgo (`capitalRange`, `acceptableLossRange`) fueron eliminados del formulario pero sus columnas de BD siguen existiendo; la server action `saveSituation` los sobreescribe con `null` explícitamente en el branch `update`; y el motor de scoring lee esas columnas sin valor disponible, cayendo siempre en el fallback de 50. Un defecto paralelo afecta a `personal_fit_answers`: `pfit_process_comfort_score` no existe como columna en Prisma, no se persiste en `savePersonalFit`, y ni `pfit_uncertainty_comfort_score` ni `pfit_process_comfort_score` son leídos por el scoring aunque el formulario ya los recoge.

La estrategia de fix es mínima e incremental: (1) añadir los campos faltantes a los schemas Zod como `optional()`, (2) mostrarlos en el formulario `ProfileForm`, (3) corregir los dos upserts en `actions.ts`, (4) añadir `pfit_process_comfort_score` al schema de Prisma y al tipo `AssessmentBase`, (5) actualizar `calculateDeterministicScores` para leer los cuatro campos nuevos sin cambiar la firma pública ni los tipos exportados.

> **⚠️ Prisma schema change**: El fix toca `prisma/schema.prisma`. Después de aplicar los cambios el usuario deberá ejecutar `npx prisma db push` (o generar y aplicar una migración) para crear la columna `pfit_process_comfort_score` en la base de datos.

---

## Glossary

- **Bug_Condition (C)**: La condición que activa el defecto — `aprf_acceptable_loss_range` y `aprf_capital_available_range` son `null` porque el formulario no los recoge y `saveSituation` los sobreescribe explícitamente.
- **Property (P)**: El comportamiento correcto esperado — `riskScore` refleja la tolerancia al riesgo declarada por el usuario; `personalFitScore` incluye las señales de comodidad con la incertidumbre y los procesos.
- **Preservation**: El comportamiento que no debe cambiar — la firma pública de `calculateDeterministicScores`, todos los demás campos del formulario "perfil", y las otras cuatro dimensiones de scoring (`financial`, `commercial`, `time`, `scalability`).
- **`situationSchema`**: Schema Zod en `src/lib/onboarding/schemas.ts` que valida el formulario del paso "perfil". Actualmente no incluye `capitalRange` ni `acceptableLossRange`.
- **`saveSituation`**: Server action en `src/app/analizar/actions.ts` que persiste el paso "perfil". El branch `update` del upsert fija `aprf_capital_available_range: null` y `aprf_acceptable_loss_range: null` explícitamente.
- **`savePersonalFit`**: Server action en `src/app/analizar/actions.ts` que persiste el paso "ajuste". Parsea `processComfortScore` con `personalFitSchema` pero nunca lo escribe al upsert.
- **`calculateDeterministicScores`**: Función en `src/lib/scoring/types.ts` que calcula los seis scores de dimensión. Punto central del defecto de scoring.
- **`scoreFromRange`**: Utilidad interna de `types.ts` que mapea un string range a un número y devuelve 50 cuando el valor es `null` o `undefined`.
- **`AssessmentBase`**: Tipo en `src/lib/onboarding/assessment-utils.ts` que define la forma del objeto assessment que recibe `calculateDeterministicScores`. No incluye `pfit_process_comfort_score`.

---

## Bug Details

### Bug Condition

El defecto se activa cuando un assessment completa el paso "perfil" sin ver los campos de capital y pérdida aceptable. `saveSituation` escribe `null` explícitamente en `assessment_profiles`, y `calculateDeterministicScores` lee esos `null` a través de `scoreFromRange`, que retorna el fallback de 50.

Un defecto paralelo e independiente ocurre siempre: `pfit_process_comfort_score` nunca se persiste porque la columna no existe en Prisma, y `pfit_uncertainty_comfort_score` sí se persiste pero no se lee en scoring.

**Formal Specification:**
```
FUNCTION isBugCondition(assessment)
  INPUT: assessment of type AssessmentWithRelations
  OUTPUT: boolean

  RETURN assessment.assessment_profile.aprf_acceptable_loss_range IS NULL
    AND assessment.assessment_profile.aprf_capital_available_range IS NULL
END FUNCTION

-- El defecto de personalFitScore es incondicionado (siempre activo):
FUNCTION isPersonalFitBugCondition()
  OUTPUT: boolean
  -- pfit_process_comfort_score nunca se persiste → columna inexistente
  -- pfit_uncertainty_comfort_score se persiste pero nunca se lee
  RETURN TRUE
END FUNCTION
```

### Ejemplos

- **Caso típico (bug activo)**: Usuario completa el formulario "perfil" actual → `aprf_acceptable_loss_range = null`, `aprf_capital_available_range = null` → `riskScore = clamp(100 - 50 + 0) = 50`. Independientemente del capital real o tolerancia al riesgo del emprendedor.
- **Caso extremo (bug activo)**: Usuario invertiría $500k pero solo toleraría perder $5k → debería obtener `riskScore` muy bajo (≤ 30) → obtiene 50 por el mismo motivo.
- **Assessments previos sin los campos (comportamiento preservado)**: Si `aprf_acceptable_loss_range` es `null` porque el assessment es anterior al fix, `scoreFromRange` devuelve 50 tal como hoy — sin errores.
- **`pfit_process_comfort_score` (siempre activo)**: Un usuario con baja comodidad con procesos (`processComfortScore = 1`) debería influir en `personalFitScore`; actualmente no tiene ningún efecto.

---

## Expected Behavior

### Preservation Requirements

**Comportamientos que deben permanecer inalterados:**
- `calculateDeterministicScores(assessment: AssessmentWithRelations): DeterministicScoreResult` — la firma y el tipo de retorno no cambian.
- El cálculo de `financialScore`, `commercialScore`, `timeScore` y `scalabilityScore` usa exactamente la misma lógica y pesos actuales.
- Todos los campos existentes del formulario "perfil" (`currentSituation`, `mainGoal`, `entrepreneurshipExperience`, `hoursPerWeekRange`, `availableSchedule`, `expectedIncomeTimeframe`) continúan siendo obligatorios y se guardan igual.
- `saveSituation` redirige al paso "ajuste" tras guardado exitoso, sin cambios en el flujo.
- Los campos `capitalRange` y `acceptableLossRange` son `optional()` en Zod para mantener compatibilidad con assessments anteriores.
- Assessments con `aprf_acceptable_loss_range = null` (sin los nuevos campos) no producen errores de runtime y devuelven el fallback de 50 como antes.
- `savePersonalFit` continúa guardando `pfit_sales_comfort_score`, `pfit_uncertainty_comfort_score`, `pfit_work_preference`, `pfit_enjoyed_activities` y `pfit_hiring_preference` correctamente.

**Scope:** Todo input que no involucre los campos `capitalRange`, `acceptableLossRange` o `processComfortScore` queda completamente inalterado.

> **Nota:** El comportamiento correcto esperado (la propiedad P) está definido formalmente en la sección de Correctness Properties.

---

## Hypothesized Root Cause

### 1. Regresión por eliminación incompleta de campos del formulario

En algún punto del desarrollo se eliminaron las preguntas de capital y pérdida aceptable del formulario "perfil" — probablemente para simplificarlo — pero no se actualizaron `situationSchema`, `saveSituation`, ni `calculateDeterministicScores` de forma consistente. Las columnas siguen en Prisma porque los datos de scoring las necesitan.

### 2. Sobreescritura explícita en el branch `update` de `saveSituation`

El upsert tiene un comportamiento asimétrico:
- `create` branch: no incluye `aprf_capital_available_range` ni `aprf_acceptable_loss_range` → Prisma deja esos campos sin valor (o con el valor previo si la fila ya existía, pero al ser `create` implica fila nueva → columnas quedan `null` por defecto).
- `update` branch: incluye `aprf_capital_available_range: null` y `aprf_acceptable_loss_range: null` explícitamente → **borra cualquier valor que pudiera haberse guardado por otro medio**.

Esto significa que incluso si un usuario tuviera esos valores de un assessment anterior, el primer submit del formulario "perfil" los destruiría.

### 3. Columna `pfit_process_comfort_score` nunca fue añadida a Prisma

El campo `processComfortScore` fue añadido a `personalFitSchema` y al formulario `PersonalFitForm`, pero la migración correspondiente en `prisma/schema.prisma` y en el tipo `AssessmentBase` se omitió. Consecuencia: el valor se parsea, se pasa al upsert, pero Prisma no lo conoce → la columna no existe → el campo se ignora silenciosamente (Prisma TypeScript client generaría error de tipo, pero si la key no está en el schema del modelo, simplemente no se envía a la BD).

### 4. `pfit_uncertainty_comfort_score` guardado pero no leído en scoring

El campo se persiste correctamente en `savePersonalFit`. El olvido es solo en `calculateDeterministicScores`, que construye `personalFitScore` sin leerlo.

### 5. Ausencia de tests que validen el flujo completo de scoring

No hay tests que verifiquen que `aprf_acceptable_loss_range = "menos_5k"` produce un `riskScore ≤ 35`, lo que habría detectado la regresión.

---

## Correctness Properties

Property 1: Bug Condition — riskScore refleja la tolerancia al riesgo declarada

_For any_ assessment donde el bug condition NO se cumple (el usuario respondió `acceptableLossRange`), la función `calculateDeterministicScores` fijada SHALL producir un `riskScore` que refleje el valor declarado: específicamente, para `aprf_acceptable_loss_range = "menos_5k"` y `finp_initial_investment ≥ 50000`, el `riskScore` SHALL ser ≥ 80 (alta puntuación de riesgo = el emprendedor está tomando un riesgo elevado respecto a su tolerancia declarada).

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Bug Condition — personalFitScore incluye uncertainty y process comfort

_For any_ assessment donde `pfit_uncertainty_comfort_score` y `pfit_process_comfort_score` tienen valores no-nulos, la función `calculateDeterministicScores` fijada SHALL incluir esas señales en el cálculo de `personalFitScore`, produciendo scores distintos para perfiles con valores extremos (1 vs 5) en esas dimensiones.

**Validates: Requirements 2.5, 2.6**

Property 3: Preservation — assessments sin los nuevos campos no producen errores

_For any_ assessment donde `aprf_acceptable_loss_range = null` y `aprf_capital_available_range = null` (assessments anteriores al fix, o bug condition activa), la función `calculateDeterministicScores` fijada SHALL retornar un resultado válido de tipo `DeterministicScoreResult` sin lanzar excepciones, con `dimensions.length === 6`.

**Validates: Requirements 3.2, 3.3, 3.5**

Property 4: Preservation — otros scores no cambian

_For any_ assessment, los valores de `financialScore`, `commercialScore`, `timeScore` y `scalabilityScore` producidos por la función fijada SHALL ser idénticos a los producidos por la función original para el mismo input.

**Validates: Requirements 3.4, 3.5**

---

## Fix Implementation

### Cambio 1: `prisma/schema.prisma` — añadir columna `pfit_process_comfort_score`

> **⚠️ Requiere `npx prisma db push` o migración por el usuario después de aplicar este cambio.**

**Archivo:** `prisma/schema.prisma`

**Modelo:** `personal_fit_answers`

**Cambio:** Añadir el campo que ya existe en `personalFitSchema` y en el formulario pero no en la BD:

```prisma
model personal_fit_answers {
  // ... campos existentes ...
  pfit_process_comfort_score   Int?    // ← añadir esta línea
  // ...
}
```

---

### Cambio 2: `src/lib/onboarding/assessment-utils.ts` — añadir `pfit_process_comfort_score` al tipo

**Archivo:** `src/lib/onboarding/assessment-utils.ts`

**Tipo:** `AssessmentBase.personal_fit_answers`

**Cambio:** Añadir el campo al tipo inline para que `calculateDeterministicScores` pueda leerlo con type safety:

```typescript
personal_fit_answers?: {
  pfit_enjoyed_activities: unknown;
  pfit_work_preference: string | null;
  pfit_sales_comfort_score: number | null;
  pfit_uncertainty_comfort_score: number | null;
  pfit_process_comfort_score: number | null;  // ← añadir
  pfit_hiring_preference: string | null;
} | null;
```

---

### Cambio 3: `src/lib/onboarding/schemas.ts` — añadir campos opcionales a `profileSchema`

**Archivo:** `src/lib/onboarding/schemas.ts`

**Schema:** `profileSchema` (y por composición, `situationSchema`)

**Cambio:** Añadir dos campos opcionales para mantener retrocompatibilidad con assessments existentes:

```typescript
export const profileSchema = z.object({
  currentSituation: z.string().min(1, "Selecciona tu situación actual"),
  mainGoal: z.string().min(1, "Selecciona tu objetivo principal"),
  entrepreneurshipExperience: z.string().min(1, "Selecciona tu experiencia"),
  capitalRange: z.string().optional(),           // ← añadir
  acceptableLossRange: z.string().optional(),    // ← añadir
});
```

`situationSchema = profileSchema.merge(resourcesSchema)` los hereda automáticamente, sin cambios adicionales.

---

### Cambio 4: `src/app/analizar/actions.ts` — corregir `saveSituation`

**Archivo:** `src/app/analizar/actions.ts`

**Función:** `saveSituation`

**Cambio A — parsear los nuevos campos del FormData:**

```typescript
const parsed = situationSchema.safeParse({
  currentSituation: formData.get("currentSituation"),
  mainGoal: formData.get("mainGoal"),
  entrepreneurshipExperience: formData.get("entrepreneurshipExperience"),
  hoursPerWeekRange: formData.get("hoursPerWeekRange"),
  availableSchedule: formData.get("availableSchedule"),
  expectedIncomeTimeframe: formData.get("expectedIncomeTimeframe"),
  capitalRange: formData.get("capitalRange") ?? undefined,          // ← añadir
  acceptableLossRange: formData.get("acceptableLossRange") ?? undefined, // ← añadir
});
```

**Cambio B — corregir el branch `update` del upsert:**

Eliminar las dos líneas que sobreescriben con `null` y reemplazarlas con los valores parseados (que serán `undefined` si no se enviaron, haciendo que Prisma no toque esas columnas):

```typescript
await prisma.assessment_profiles.upsert({
  where: { aprf_asmt_id: assessment.asmt_id },
  create: {
    aprf_asmt_id: assessment.asmt_id,
    aprf_current_situation: data.currentSituation,
    aprf_main_goal: data.mainGoal,
    aprf_entrepreneurship_experience: data.entrepreneurshipExperience,
    aprf_capital_available_range: data.capitalRange ?? null,        // ← añadir
    aprf_acceptable_loss_range: data.acceptableLossRange ?? null,   // ← añadir
    aprf_hours_per_week_range: data.hoursPerWeekRange,
    aprf_available_schedule: data.availableSchedule,
    aprf_expected_income_timeframe: data.expectedIncomeTimeframe,
  },
  update: {
    aprf_current_situation: data.currentSituation,
    aprf_main_goal: data.mainGoal,
    aprf_entrepreneurship_experience: data.entrepreneurshipExperience,
    aprf_capital_available_range: data.capitalRange ?? null,        // ← reemplaza null hardcoded
    aprf_acceptable_loss_range: data.acceptableLossRange ?? null,   // ← reemplaza null hardcoded
    aprf_hours_per_week_range: data.hoursPerWeekRange,
    aprf_available_schedule: data.availableSchedule,
    aprf_expected_income_timeframe: data.expectedIncomeTimeframe,
  },
});
```

> **Nota de diseño sobre `?? null`:** Usar `data.capitalRange ?? null` en lugar de simplemente `data.capitalRange` es deliberado: Prisma distingue entre `undefined` (no tocar la columna) y `null` (escribir NULL). Aquí queremos que si el usuario no seleccionó nada, se escriba `null` explícitamente — refleja que no respondió la pregunta.

**Cambio C — corregir `savePersonalFit` para persistir `pfit_process_comfort_score`:**

Añadir el campo en ambos branches del upsert (requiere Cambio 1 previo):

```typescript
await prisma.personal_fit_answers.upsert({
  where: { pfit_asmt_id: assessment.asmt_id },
  create: {
    pfit_asmt_id: assessment.asmt_id,
    pfit_enjoyed_activities: data.enjoyedActivities,
    pfit_work_preference: data.workPreference,
    pfit_sales_comfort_score: data.salesComfortScore,
    pfit_uncertainty_comfort_score: data.uncertaintyComfortScore,
    pfit_hiring_preference: data.hiringPreference,
    pfit_process_comfort_score: data.processComfortScore,  // ← añadir
  },
  update: {
    pfit_enjoyed_activities: data.enjoyedActivities,
    pfit_work_preference: data.workPreference,
    pfit_sales_comfort_score: data.salesComfortScore,
    pfit_uncertainty_comfort_score: data.uncertaintyComfortScore,
    pfit_hiring_preference: data.hiringPreference,
    pfit_process_comfort_score: data.processComfortScore,  // ← añadir
  },
});
```

---

### Cambio 5: `src/components/onboarding/profile-form.tsx` — añadir los campos al formulario

**Archivo:** `src/components/onboarding/profile-form.tsx`

**Cambio A — importar las opciones de capital y pérdida aceptable:**

```typescript
import {
  CURRENT_SITUATION_OPTIONS,
  MAIN_GOAL_OPTIONS,
  EXPERIENCE_OPTIONS,
  CAPITAL_RANGE_OPTIONS,    // ← añadir
  LOSS_RANGE_OPTIONS,       // ← añadir
  HOURS_RANGE_OPTIONS,
  SCHEDULE_OPTIONS,
  INCOME_TIMEFRAME_OPTIONS,
} from "@/lib/onboarding/options";
```

**Cambio B — añadir un nuevo `FieldSet` "Tu capital y riesgo" con los dos campos:**

Insertar después del `FieldSet` "Sobre ti" y antes del `FieldSet` "Tu disponibilidad":

```tsx
<FieldSet>
  <FieldLegend>Tu capital y riesgo</FieldLegend>
  <CardSelectField
    name="capitalRange"
    label="¿Cuánto capital podrías invertir como máximo?"
    options={CAPITAL_RANGE_OPTIONS}
    defaultValue={fieldValue(v, "capitalRange", profile?.aprf_capital_available_range ?? "")}
    error={state.fieldErrors?.capitalRange}
  />
  <CardSelectField
    name="acceptableLossRange"
    label="¿Cuánto estarías dispuesto a perder si no funciona?"
    options={LOSS_RANGE_OPTIONS}
    defaultValue={fieldValue(v, "acceptableLossRange", profile?.aprf_acceptable_loss_range ?? "")}
    error={state.fieldErrors?.acceptableLossRange}
  />
</FieldSet>
```

> **Nota:** Los campos son opcionales en el schema Zod, por lo que si el usuario no selecciona ninguna opción el formulario igual avanza. La UI no muestra un asterisco de "requerido" para estos campos. `CardSelectField` no pasa `required` al `OptionCardGroup` para estos dos campos opcionales.

---

### Cambio 6: `src/lib/scoring/types.ts` — actualizar `calculateDeterministicScores`

**Archivo:** `src/lib/scoring/types.ts`

**Cambio A — incluir `uncertaintyComfortScore` y `processComfortScore` en `personalFitScore`:**

El cálculo actual de `personalFitScore` suma 60 puntos máximos (`salesComfort * 12 = 60`) + 15 (workPreference) + 15 (hiringPreference) = 90 puntos máximos antes de `clamp`. Los nuevos campos añaden hasta 10 puntos cada uno (score 1–5 mapeado a 2–10), manteniendo la escala calibrada y el resultado dentro de `clampScore`.

```typescript
const personalFitScore = clampScore(
  (fit?.pfit_sales_comfort_score ?? 3) * 12 +
    scoreFromRange(fit?.pfit_work_preference, {
      digital: 15,
      mixto: 12,
      fisico: 10,
    }) +
    scoreFromRange(fit?.pfit_hiring_preference, {
      solo: 10,
      algunos: 12,
      equipo: 15,
    }) +
    (fit?.pfit_uncertainty_comfort_score ?? 3) * 2 +  // ← añadir: 2–10 pts
    (fit?.pfit_process_comfort_score ?? 3) * 2         // ← añadir: 2–10 pts
);
```

> **Justificación de los pesos:** El rango `* 2` produce 2–10 puntos por campo (score 1–5). Son pesos modestos — cada campo vale aproximadamente lo mismo que un cuarto del rango de `salesComfort` — reflejando que son señales de personalidad relevantes pero secundarias respecto a la comodidad de venta. El fallback `?? 3` aplica la misma convención que `scoreFromRange` (valor neutro de mitad de rango) para assessments sin el dato.

**Cambio B — ajustar el cálculo de `riskScore` para reflejar también la inversión relativa al capital disponible:**

La fórmula actual solo usa `aprf_acceptable_loss_range`. Para reforzar la señal cuando el usuario declara la inversión inicial, añadir un factor de comparación relativa. Sin embargo, dado que `aprf_capital_available_range` es un rango string y `finp_initial_investment` es un número, la comparación requiere estimar el centro del rango. Para mantener el cambio mínimo y no introducir lógica de mapeo adicional, el fix del `riskScore` **solo corrige el dato de entrada** (al persistir `aprf_acceptable_loss_range` correctamente, `scoreFromRange` ya produce el valor correcto con los pesos existentes). No se modifica la fórmula del `riskScore`.

```typescript
// Sin cambios en la fórmula de riskScore — el fix es en la persistencia del dato.
// Con aprf_acceptable_loss_range correctamente guardado:
// - "menos_5k" → scoreFromRange retorna 10 → riskScore = clamp(100 - 10 + bonus) = 90+
// - "mas_100k"  → scoreFromRange retorna 65 → riskScore = clamp(100 - 65 + bonus) = 35-45
const riskScore = clampScore(
  100 -
    scoreFromRange(profile?.aprf_acceptable_loss_range, {
      menos_5k: 10,
      "5k_20k": 20,
      "20k_50k": 35,
      "50k_100k": 50,
      mas_100k: 65,
    }) +
    (market?.mrsk_has_talked_to_customers ? 10 : 0)
  // Sin cambios
);
```

> **Semántica confirmada:** `riskScore` representa "nivel de riesgo tomado" — alto = malo. La fórmula `100 - penalty` es correcta: `"menos_5k"` (tolerancia mínima) produce `riskScore ≈ 90` (riesgo muy alto), `"mas_100k"` (tolerancia alta) produce `riskScore ≈ 35` (riesgo bajo). No hay deuda técnica pendiente en esta dimensión.

---

## Testing Strategy

### Validation Approach

La estrategia sigue dos fases: primero ejecutar tests exploratorios en el código **sin fixear** para observar los fallos y confirmar el root cause; luego aplicar el fix y verificar tanto el comportamiento correcto como la preservación.

### Exploratory Bug Condition Checking

**Objetivo:** Confirmar el root cause observando fallos en el código original. Si los tests no fallan donde se espera, el root cause debe revisarse.

**Test Plan:** Crear tests unitarios de `calculateDeterministicScores` con inputs controlados que tengan `aprf_acceptable_loss_range = "menos_5k"`, ejecutarlos sobre el código original, y observar que retornan `riskScore ≈ 50` en lugar de un valor bajo.

**Test Cases (a ejecutar en código sin fixear):**
1. **riskScore ignorante del acceptable_loss**: Crear un assessment con `aprf_acceptable_loss_range = "menos_5k"` y `mrsk_has_talked_to_customers = false` → esperar `riskScore = 50`, confirmar que es incorrecto.
2. **saveSituation destruye valores**: Simular un upsert donde la fila ya tiene `aprf_acceptable_loss_range = "menos_5k"` → ejecutar `saveSituation` → verificar que la BD queda con `null`. Confirma el sobreescritura.
3. **personalFitScore insensible a uncertainty**: Crear dos assessments idénticos excepto `pfit_uncertainty_comfort_score = 1` vs `= 5` → verificar que `personalFitScore` es idéntico en ambos (confirma bug).
4. **processComfortScore ignorado**: Verificar que el tipo `AssessmentBase.personal_fit_answers` no tiene `pfit_process_comfort_score` y que el upsert de `savePersonalFit` no lo incluye.

**Expected Counterexamples:**
- `riskScore` siempre retorna valores entre 50 y 60 independientemente de `aprf_acceptable_loss_range`.
- El upsert de `saveSituation` en branch `update` fija `aprf_acceptable_loss_range: null`.

### Fix Checking

**Objetivo:** Verificar que para todos los inputs donde el bug condition se cumplía, el código fijado produce el comportamiento correcto.

**Pseudocode:**
```
FOR ALL assessment WHERE isBugCondition(assessment) IS FALSE
  AND assessment.assessment_profile.aprf_acceptable_loss_range IS NOT NULL DO

  result := calculateDeterministicScores_fixed(assessment)
  riskDim := result.dimensions.find(d => d.key = "risk_level")

  IF assessment.assessment_profile.aprf_acceptable_loss_range = "menos_5k"
    AND assessment.financial_inputs.finp_initial_investment >= 50000 THEN
    ASSERT riskDim.score > 60  -- Alta puntuación de riesgo = baja tolerancia
  END IF

  fitDim := result.dimensions.find(d => d.key = "personal_fit")
  -- Dos perfiles idénticos excepto en uncertainty/process → scores distintos
  ASSERT fitDim.score IS SENSITIVE TO pfit_uncertainty_comfort_score
  ASSERT fitDim.score IS SENSITIVE TO pfit_process_comfort_score
END FOR
```

### Preservation Checking

**Objetivo:** Verificar que para assessments con `aprf_acceptable_loss_range = null` (bug condition activa) y para todas las demás dimensiones, el comportamiento es idéntico al original.

**Pseudocode:**
```
FOR ALL assessment WHERE isBugCondition(assessment) DO
  result := calculateDeterministicScores_fixed(assessment)
  ASSERT result IS NOT NULL
  ASSERT result.dimensions.length = 6
  ASSERT NO_RUNTIME_ERROR

  -- Las otras 4 dimensiones no cambian
  FOR each key IN ["financial_viability", "commercial_viability", "time_fit", "scalability"] DO
    ASSERT result_fixed.dimensions[key].score = result_original.dimensions[key].score
  END FOR
END FOR
```

**Testing Approach:** Property-based testing para el caso de preservación: generar assessments aleatorios con `aprf_acceptable_loss_range = null` y verificar que no hay errores y que las otras dimensiones tienen los mismos valores. PBT es adecuado aquí porque el espacio de combinaciones de campos financieros y de mercado es amplio.

### Unit Tests

**Archivo sugerido:** `src/lib/scoring/__tests__/types.test.ts`

- Test: `calculateDeterministicScores` con `aprf_acceptable_loss_range = null` retorna `riskScore = 50` (preservación de assessments viejos).
- Test: `calculateDeterministicScores` con `aprf_acceptable_loss_range = "menos_5k"` y `mrsk_has_talked_to_customers = false` retorna `riskScore = 90`.
- Test: `calculateDeterministicScores` con `aprf_acceptable_loss_range = "mas_100k"` retorna `riskScore = 35` (alta tolerancia → menor score de riesgo).
- Test: Dos assessments con `pfit_uncertainty_comfort_score = 1` vs `= 5` producen `personalFitScore` distinto en ≥ 8 puntos.
- Test: Dos assessments con `pfit_process_comfort_score = 1` vs `= 5` producen `personalFitScore` distinto en ≥ 8 puntos.
- Test: Scores `financialScore`, `commercialScore`, `timeScore`, `scalabilityScore` son idénticos antes y después del fix para el mismo input.

**Archivo sugerido:** `src/app/analizar/__tests__/actions.test.ts` (o equivalente en el framework de test del proyecto)

- Test: `saveSituation` con `capitalRange = "10k_50k"` y `acceptableLossRange = "5k_20k"` escribe esos valores en `assessment_profiles`, no `null`.
- Test: `saveSituation` sin `capitalRange` ni `acceptableLossRange` en el FormData no rompe la validación y escribe `null` (no `undefined`) en la BD.
- Test: `savePersonalFit` con `processComfortScore = 2` escribe `pfit_process_comfort_score = 2` en `personal_fit_answers`.

### Property-Based Tests

**Archivo sugerido:** `src/lib/scoring/__tests__/types.pbt.test.ts`

- **Property 3 (Preservation):** Para cualquier assessment generado aleatoriamente con `aprf_acceptable_loss_range = null`, `calculateDeterministicScores` no lanza excepciones y retorna un objeto con `dimensions.length = 6`.
- **Property 4 (Preservation de otras dimensiones):** Para cualquier assessment generado aleatoriamente, los scores de `financialScore`, `commercialScore`, `timeScore` y `scalabilityScore` son idénticos entre la versión original y la fijada.
- **Property sensibilidad de riskScore:** Para cualquier assessment con `aprf_acceptable_loss_range` no-nulo, el `riskScore` está en el rango esperado según el mapa de `scoreFromRange` (20–100).

### Integration Tests

- Flujo completo del paso "perfil" → "ajuste" → scoring: verificar que un assessment que completa ambos pasos produce un `riskScore` que refleja el `acceptableLossRange` declarado.
- Re-submit del paso "perfil" (branch `update` del upsert): verificar que los valores de capital y pérdida se conservan o actualizan correctamente en re-submissions.
- Compatibilidad con assessments sin los nuevos campos: un assessment creado antes del fix pasa por el pipeline de scoring sin errores.

---

## Resumen de archivos modificados

| Archivo | Tipo de cambio | Requiere acción del usuario |
|---|---|---|
| `prisma/schema.prisma` | Añadir columna `pfit_process_comfort_score Int?` al modelo `personal_fit_answers` | **Sí — `npx prisma db push` o migración** |
| `src/lib/onboarding/assessment-utils.ts` | Añadir `pfit_process_comfort_score: number \| null` al tipo `AssessmentBase` | No |
| `src/lib/onboarding/schemas.ts` | Añadir `capitalRange` y `acceptableLossRange` como `optional()` a `profileSchema` | No |
| `src/app/analizar/actions.ts` | Corregir `saveSituation` (parseo + upsert) y `savePersonalFit` (upsert) | No |
| `src/components/onboarding/profile-form.tsx` | Añadir `FieldSet` con `capitalRange` y `acceptableLossRange` | No |
| `src/lib/scoring/types.ts` | Incluir `uncertaintyComfortScore` y `processComfortScore` en `personalFitScore` | No |
