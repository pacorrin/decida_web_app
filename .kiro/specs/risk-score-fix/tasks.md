# Implementation Plan

## Overview

Este plan implementa el fix para los bugs de `riskScore` y `personalFitScore` que no reflejan los campos de perfil del usuario. El enfoque sigue la metodología de bug condition: primero se escriben tests de exploración (que fallan en código sin fixear para confirmar el bug), luego tests de preservación (que pasan en código sin fixear para capturar el baseline), y finalmente se aplican los cambios necesarios en schema Prisma, tipos TypeScript, schemas Zod, server actions, formulario y función de scoring, verificando al final que todos los tests pasan sin regresiones.

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - riskScore insensible a aprf_acceptable_loss_range
  - **CRITICAL**: Este test MUST FAIL en el código sin fixear — el fallo confirma que el bug existe
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: El test codifica el comportamiento esperado — validará el fix cuando pase tras la implementación
  - **GOAL**: Exponer contraejemplos que demuestren que el bug existe
  - **Prerequisito**: Instalar vitest si no está disponible (`npm install -D vitest @vitest/coverage-v8`)
  - Crear `src/lib/scoring/__tests__/types.test.ts`
  - Test A — Bug Condition riskScore: construir un assessment con `aprf_acceptable_loss_range = "menos_5k"` y `mrsk_has_talked_to_customers = false` y verificar que `riskScore` es ≥ 80 (alta puntuación = alta exposición al riesgo para tolerancia mínima)
  - Test B — Bug Condition personalFitScore: construir dos assessments idénticos con `pfit_uncertainty_comfort_score = 1` vs `= 5` y verificar que `personalFitScore` difiere en ≥ 8 puntos
  - Test C — Bug Condition personalFitScore: construir dos assessments idénticos con `pfit_process_comfort_score = 1` vs `= 5` y verificar que `personalFitScore` difiere en ≥ 8 puntos
  - Ejecutar tests en código SIN fixear: `npx vitest run src/lib/scoring/__tests__/types.test.ts`
  - **EXPECTED OUTCOME**: Tests FAIL (esto es correcto — prueba que el bug existe)
  - Documentar los contraejemplos encontrados (e.g., `riskScore = 50` cuando se esperaba ≥ 80)
  - Marcar la tarea como completa cuando el test esté escrito, ejecutado, y el fallo esté documentado
  - _Requirements: 1.2, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - assessments sin los nuevos campos no producen errores y otras dimensiones no cambian
  - **IMPORTANT**: Seguir metodología observation-first
  - **Prerequisito**: Vitest ya instalado en tarea 1
  - Añadir tests de preservación al archivo `src/lib/scoring/__tests__/types.test.ts`
  - Observar: con `aprf_acceptable_loss_range = null`, `calculateDeterministicScores` retorna `riskScore = 50` en el código actual
  - Observar: `financialScore`, `commercialScore`, `timeScore` y `scalabilityScore` tienen valores reproducibles para inputs fijos
  - Test D — Preservation null: construir un assessment con `aprf_acceptable_loss_range = null` y verificar que `calculateDeterministicScores` no lanza excepción y retorna `dimensions.length === 6`
  - Test E — Preservation otras dimensiones: construir un assessment completo y verificar que los cuatro scores (`financial_viability`, `commercial_viability`, `time_fit`, `scalability`) tienen valores específicos reproducibles (capturar los valores actuales como expected)
  - Ejecutar tests en código SIN fixear: `npx vitest run src/lib/scoring/__tests__/types.test.ts`
  - **EXPECTED OUTCOME**: Tests PASS (esto confirma el comportamiento baseline a preservar)
  - Marcar la tarea como completa cuando los tests estén escritos, ejecutados, y pasando en código sin fixear
  - _Requirements: 3.3, 3.4, 3.5_

- [x] 3. Fix: risk score y personal fit score no reflejan campos de perfil

  - [x] 3.1 Añadir columna `pfit_process_comfort_score` al schema de Prisma
    - **⚠️ ACCIÓN REQUERIDA DEL USUARIO**: Después de aplicar este cambio, el usuario DEBE ejecutar `npx prisma db push` (o generar y aplicar una migración con `npx prisma migrate dev`) para crear la columna en la base de datos. Sin este paso, los cambios en la server action fallarán en runtime.
    - Abrir `prisma/schema.prisma`
    - En el modelo `personal_fit_answers`, añadir la línea: `pfit_process_comfort_score   Int?`
    - Posicionar el campo después de `pfit_uncertainty_comfort_score` y antes de `pfit_hiring_preference`
    - Verificar que el cliente Prisma regenerado incluye el nuevo campo ejecutando `npx prisma generate`
    - _Bug_Condition: isPersonalFitBugCondition() → pfit_process_comfort_score columna inexistente_
    - _Expected_Behavior: pfit_process_comfort_score persiste correctamente en personal_fit_answers_
    - _Preservation: Todos los demás campos del modelo personal_fit_answers sin cambios_
    - _Requirements: 2.6_

  - [x] 3.2 Añadir `pfit_process_comfort_score` al tipo `AssessmentBase`
    - Abrir `src/lib/onboarding/assessment-utils.ts`
    - En el tipo inline de `personal_fit_answers` dentro de `AssessmentBase`, añadir: `pfit_process_comfort_score: number | null;`
    - Posicionar después de `pfit_uncertainty_comfort_score` y antes de `pfit_hiring_preference`
    - _Bug_Condition: AssessmentBase no expone pfit_process_comfort_score → calculateDeterministicScores no puede leerlo_
    - _Expected_Behavior: calculateDeterministicScores puede leer pfit_process_comfort_score con type safety_
    - _Preservation: Ningún otro campo del tipo AssessmentBase cambia_
    - _Requirements: 2.5, 2.6_

  - [x] 3.3 Añadir `capitalRange` y `acceptableLossRange` como opcionales a `profileSchema`
    - Abrir `src/lib/onboarding/schemas.ts`
    - En `profileSchema`, añadir dos campos opcionales:
      - `capitalRange: z.string().optional()`
      - `acceptableLossRange: z.string().optional()`
    - Verificar que `situationSchema = profileSchema.merge(resourcesSchema)` hereda los campos automáticamente sin cambios adicionales
    - Los campos son `optional()` para mantener retrocompatibilidad con assessments anteriores que no tienen estos datos
    - _Bug_Condition: situationSchema no incluye capitalRange ni acceptableLossRange → saveSituation no los parsea del FormData_
    - _Expected_Behavior: saveSituation parsea capitalRange y acceptableLossRange cuando están presentes_
    - _Preservation: currentSituation, mainGoal, entrepreneurshipExperience siguen siendo obligatorios; flujo de redirección sin cambios_
    - _Requirements: 2.1, 2.2, 3.7_

  - [x] 3.4 Corregir `saveSituation` y `savePersonalFit` en `actions.ts`
    - Abrir `src/app/analizar/actions.ts`
    - **Cambio A — `saveSituation` parseo**: En la llamada a `situationSchema.safeParse()`, añadir los dos campos nuevos:
      - `capitalRange: formData.get("capitalRange") ?? undefined`
      - `acceptableLossRange: formData.get("acceptableLossRange") ?? undefined`
    - **Cambio B — `saveSituation` upsert branch `create`**: Añadir en el objeto `create`:
      - `aprf_capital_available_range: data.capitalRange ?? null`
      - `aprf_acceptable_loss_range: data.acceptableLossRange ?? null`
    - **Cambio C — `saveSituation` upsert branch `update`**: Reemplazar las líneas hardcoded `aprf_capital_available_range: null` y `aprf_acceptable_loss_range: null` por:
      - `aprf_capital_available_range: data.capitalRange ?? null`
      - `aprf_acceptable_loss_range: data.acceptableLossRange ?? null`
    - Nota: `?? null` es deliberado — Prisma distingue `undefined` (no tocar columna) de `null` (escribir NULL). Si el usuario no seleccionó nada, se escribe `null` para reflejar que no respondió.
    - **Cambio D — `savePersonalFit` upsert branch `create`**: Añadir `pfit_process_comfort_score: data.processComfortScore`
    - **Cambio E — `savePersonalFit` upsert branch `update`**: Añadir `pfit_process_comfort_score: data.processComfortScore`
    - _Bug_Condition: saveSituation sobreescribe aprf_acceptable_loss_range con null; savePersonalFit no persiste pfit_process_comfort_score_
    - _Expected_Behavior: Los valores declarados por el usuario se guardan correctamente en ambas server actions_
    - _Preservation: Todos los demás campos del upsert (currentSituation, mainGoal, etc.) sin cambios; flujo de redirección sin cambios_
    - _Requirements: 2.2, 2.3, 2.6, 3.1, 3.6_

  - [x] 3.5 Añadir FieldSet "Tu capital y riesgo" al formulario `ProfileForm`
    - Abrir `src/components/onboarding/profile-form.tsx`
    - **Cambio A — imports**: Añadir `CAPITAL_RANGE_OPTIONS` y `LOSS_RANGE_OPTIONS` al import de `@/lib/onboarding/options`
    - **Cambio B — nuevo FieldSet**: Insertar un `<FieldSet>` nuevo entre el FieldSet "Sobre ti" y el FieldSet "Tu disponibilidad":
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
    - Los campos son opcionales en Zod, por lo que no se pasa `required` a `OptionCardGroup` para estos dos campos
    - _Bug_Condition: Los campos capitalRange y acceptableLossRange no aparecen en el formulario → el usuario nunca los puede responder_
    - _Expected_Behavior: El usuario puede seleccionar su capital disponible y pérdida aceptable en el paso "perfil"_
    - _Preservation: Todos los campos existentes del formulario (currentSituation, mainGoal, etc.) sin cambios_
    - _Requirements: 2.1_

  - [x] 3.6 Incluir `uncertaintyComfortScore` y `processComfortScore` en `personalFitScore`
    - Abrir `src/lib/scoring/types.ts`
    - En la función `calculateDeterministicScores`, localizar el cálculo de `personalFitScore`
    - Añadir los dos nuevos términos al final de la expresión dentro de `clampScore()`:
      - `+ (fit?.pfit_uncertainty_comfort_score ?? 3) * 2`  — produce 2–10 pts (score 1–5 × 2)
      - `+ (fit?.pfit_process_comfort_score ?? 3) * 2`      — produce 2–10 pts (score 1–5 × 2)
    - El fallback `?? 3` es consistente con el valor neutro de mitad de rango que usa `scoreFromRange` para campos sin dato
    - El peso `* 2` es modesto (≈ un cuarto del rango de salesComfort) para señales de personalidad secundarias
    - **NO modificar la fórmula de `riskScore`** — el fix de `riskScore` es puramente en la persistencia del dato (tareas 3.3–3.5)
    - **NO cambiar la firma pública** `calculateDeterministicScores(assessment: AssessmentWithRelations): DeterministicScoreResult`
    - _Bug_Condition: personalFitScore no lee pfit_uncertainty_comfort_score ni pfit_process_comfort_score_
    - _Expected_Behavior: personalFitScore refleja las señales de comodidad con incertidumbre y procesos_
    - _Preservation: Firma pública sin cambios; financialScore, commercialScore, timeScore, scalabilityScore usan exactamente la misma lógica_
    - _Requirements: 2.4, 2.5, 3.4, 3.5_

  - [x] 3.7 Verificar bug condition exploration test ahora pasa
    - **Property 1: Expected Behavior** - riskScore refleja tolerancia al riesgo declarada; personalFitScore sensible a uncertainty y process comfort
    - **IMPORTANT**: Re-ejecutar los MISMOS tests de la tarea 1 — NO escribir nuevos tests
    - Los tests de la tarea 1 codifican el comportamiento esperado
    - Cuando estos tests pasan, confirman que el comportamiento esperado está satisfecho
    - Ejecutar: `npx vitest run src/lib/scoring/__tests__/types.test.ts`
    - **EXPECTED OUTCOME**: Tests A, B y C ahora PASAN (confirma que el bug está corregido)
    - Si algún test falla, revisar las tareas 3.3–3.6 antes de continuar
    - _Requirements: 2.4, 2.5 — Expected Behavior Properties del design_

  - [x] 3.8 Verificar preservation tests siguen pasando
    - **Property 2: Preservation** - assessments sin los nuevos campos no producen errores; otras dimensiones sin cambios
    - **IMPORTANT**: Re-ejecutar los MISMOS tests de la tarea 2 — NO escribir nuevos tests
    - Ejecutar: `npx vitest run src/lib/scoring/__tests__/types.test.ts`
    - **EXPECTED OUTCOME**: Tests D y E siguen PASANDO (confirma que no hay regresiones)
    - Confirmar que los scores de `financial_viability`, `commercial_viability`, `time_fit` y `scalability` son idénticos a los valores capturados en la tarea 2

- [x] 4. Checkpoint — Verificar que todo pasa

  - [x] 4.1 Ejecutar type-check completo sin errores nuevos
    - Ejecutar: `npx tsc --noEmit`
    - **EXPECTED OUTCOME**: Sin errores de TypeScript nuevos introducidos por este fix
    - Si hay errores, son señal de que algún tipo (AssessmentBase, schema Zod, o scoring) quedó inconsistente — revisar tareas 3.1–3.6
    - Prestar especial atención a: que `pfit_process_comfort_score` esté en el tipo de `personal_fit_answers` en `AssessmentBase` (tarea 3.2) y que el cliente Prisma haya sido regenerado (tarea 3.1)

  - [x] 4.2 Ejecutar suite completa de tests
    - Ejecutar: `npx vitest run`
    - **EXPECTED OUTCOME**: Todos los tests pasan
    - Prestar atención a que los tests de preservación (D y E) siguen pasando con los valores baseline capturados

  - [x] 4.3 Verificar que el usuario ejecutó `npx prisma db push`
    - Confirmar con el usuario que ejecutó `npx prisma db push` (o una migración equivalente) después del cambio en `prisma/schema.prisma` de la tarea 3.1
    - Sin este paso la columna `pfit_process_comfort_score` no existirá en la base de datos y `savePersonalFit` fallará en runtime al intentar escribir el campo
    - Preguntar al usuario si tiene dudas o si surgió algún conflicto en la migración

  - [x] 4.4 Verificar manualmente el formulario en el navegador
    - Iniciar el servidor de desarrollo (`npm run dev`) y navegar al paso "perfil" (`/analizar/perfil`)
    - Confirmar que el nuevo FieldSet "Tu capital y riesgo" aparece entre "Sobre ti" y "Tu disponibilidad"
    - Confirmar que los dos `CardSelectField` muestran las opciones correctas de `CAPITAL_RANGE_OPTIONS` y `LOSS_RANGE_OPTIONS`
    - Completar el formulario con valores específicos y verificar en la base de datos que `aprf_capital_available_range` y `aprf_acceptable_loss_range` se guardan con el valor seleccionado (no `null`)
    - Completar el paso "ajuste" y verificar que `pfit_process_comfort_score` se guarda en `personal_fit_answers`
    - Completar el flujo hasta el resultado y verificar que `riskScore` en `assessment_scores` refleja el `acceptableLossRange` declarado

  - [x] 4.5 Asegurar que todos los tests pasan; preguntar al usuario si surgen dudas

## Notes

- **Migración de base de datos requerida**: Después de completar la tarea 3.1, es obligatorio ejecutar `npx prisma db push` (entorno de desarrollo) o `npx prisma migrate dev` (con historial de migraciones) para crear la columna `pfit_process_comfort_score` en la base de datos. Sin este paso, `savePersonalFit` fallará en runtime.
- **Regeneración del cliente Prisma**: Tras cualquier cambio en `prisma/schema.prisma`, ejecutar `npx prisma generate` para que los tipos TypeScript del cliente reflejen el nuevo campo.
- **Retrocompatibilidad**: Los campos `capitalRange` y `acceptableLossRange` son opcionales en Zod (`z.string().optional()`), por lo que assessments anteriores sin estos datos no se ven afectados.
- **Valor neutro de fallback**: El fallback `?? 3` en `personalFitScore` corresponde al valor medio del rango 1–5, consistente con la convención ya usada en `scoreFromRange` para campos sin dato.
- **Orden de ejecución**: Las tareas 1 y 2 deben completarse en código SIN fixear antes de aplicar cualquier cambio de implementación.
