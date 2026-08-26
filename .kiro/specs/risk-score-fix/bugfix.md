# Bugfix Requirements Document

## Introduction

El score de "Nivel de riesgo" (`risk_level`) en `calculateDeterministicScores` siempre devuelve un valor cercano a 50–60 sin importar el perfil financiero real del usuario. La causa raíz es que el campo `aprf_acceptable_loss_range` —del que depende el cálculo— nunca se escribe en la base de datos: las preguntas de capital disponible y pérdida aceptable fueron removidas del onboarding en algún punto sin actualizar el módulo de scoring. Adicionalmente, `pfit_uncertainty_comfort_score` y `pfit_process_comfort_score` se recopilan en el paso "ajuste" pero nunca se leen en el scoring, dejando esas señales de personalidad sin impacto en el diagnóstico.

El impacto es que todos los assessments reciben un riesgo prácticamente idéntico e insensible al perfil financiero del emprendedor, anulando la utilidad diagnóstica de esa dimensión.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN un usuario completa el onboarding sin ver las preguntas de capital disponible y pérdida aceptable THEN el sistema guarda `aprf_capital_available_range = null` y `aprf_acceptable_loss_range = null` en `assessment_profiles` porque esos campos no existen en `situationSchema` ni en `saveSituation`

1.2 WHEN `calculateDeterministicScores` recibe un assessment con `aprf_acceptable_loss_range = null` THEN `scoreFromRange()` retorna el fallback de 50 y el `riskScore` final oscila entre ~50 y ~60 independientemente del capital o la tolerancia al riesgo real del usuario

1.3 WHEN la acción `saveSituation` ejecuta un `update` sobre `assessment_profiles` THEN el sistema sobreescribe explícitamente `aprf_capital_available_range` y `aprf_acceptable_loss_range` con `null`, borrando cualquier valor que pudiera existir previamente

1.4 WHEN `calculateDeterministicScores` calcula `personalFitScore` THEN el sistema no lee `pfit_uncertainty_comfort_score` ni `pfit_process_comfort_score` aunque ambos estén guardados en `personal_fit_answers`, ignorando esas señales de compatibilidad personal

1.5 WHEN `savePersonalFit` persiste los datos de `personal_fit_answers` THEN el sistema no escribe `pfit_process_comfort_score` a la base de datos aunque el valor venga en el `FormData` y esté parseado por `personalFitSchema`

### Expected Behavior (Correct)

2.1 WHEN un usuario llega al paso "perfil" (`/analizar/perfil`) THEN el sistema SHALL mostrar las preguntas "¿Cuánto podrías invertir como máximo en esta idea?" (capitalRange) y "¿Cuánto estarías dispuesto a perder si no funciona?" (acceptableLossRange) usando las opciones de `CAPITAL_RANGE_OPTIONS` y `LOSS_RANGE_OPTIONS` con el mismo patrón `CardSelectField` que los demás campos de rango del paso

2.2 WHEN el usuario envía el formulario del paso "perfil" THEN el sistema SHALL escribir `capitalRange` a `aprf_capital_available_range` y `acceptableLossRange` a `aprf_acceptable_loss_range` en `assessment_profiles`, siguiendo el patrón upsert existente en `saveSituation`

2.3 WHEN `saveSituation` ejecuta el bloque `update` THEN el sistema SHALL incluir `aprf_capital_available_range` y `aprf_acceptable_loss_range` con sus valores parseados en lugar de sobreescribirlos con `null`

2.4 WHEN `calculateDeterministicScores` calcula `riskScore` con `aprf_acceptable_loss_range = "menos_5k"` y `finp_initial_investment = 50000` THEN el sistema SHALL producir un `riskScore` bajo (≤ 35) que refleje la desproporción entre la inversión y la tolerancia al riesgo declarada

2.5 WHEN `calculateDeterministicScores` calcula `personalFitScore` THEN el sistema SHALL leer `pfit_uncertainty_comfort_score` y `pfit_process_comfort_score`, convertir cada uno a un score en escala 0–100 usando el patrón `scoreFromRange()` / `clampScore()` existente, y sumarlos al `personalFitScore` con un peso razonable

2.6 WHEN `savePersonalFit` persiste los datos THEN el sistema SHALL escribir `pfit_process_comfort_score` a la columna correspondiente en `personal_fit_answers` (requiere añadir la columna al schema de Prisma si no existe)

### Unchanged Behavior (Regression Prevention)

3.1 WHEN un usuario completa el paso "perfil" con `capitalRange` y `acceptableLossRange` válidos THEN el sistema SHALL CONTINUE TO redirigir al paso "ajuste" y guardar todos los demás campos existentes (`currentSituation`, `mainGoal`, `entrepreneurshipExperience`, `hoursPerWeekRange`, `availableSchedule`, `expectedIncomeTimeframe`) sin modificación

3.2 WHEN `calculateDeterministicScores` recibe un assessment con `aprf_acceptable_loss_range` de cualquier valor válido distinto de `"menos_5k"` THEN el sistema SHALL CONTINUE TO calcular `riskScore` con la lógica `scoreFromRange` existente para ese rango, retornando valores proporcionales a la tolerancia declarada

3.3 WHEN `calculateDeterministicScores` recibe un assessment donde `aprf_acceptable_loss_range` es `null` (assessments anteriores sin el dato) THEN el sistema SHALL CONTINUE TO retornar el fallback de 50 desde `scoreFromRange()` sin lanzar errores

3.4 WHEN `calculateDeterministicScores` calcula `financialScore`, `commercialScore`, `timeScore` y `scalabilityScore` THEN el sistema SHALL CONTINUE TO usar exactamente la misma lógica y pesos actuales para esas dimensiones

3.5 WHEN la interfaz pública `calculateDeterministicScores(assessment: AssessmentWithRelations): DeterministicScoreResult` es invocada THEN el sistema SHALL CONTINUE TO retornar el mismo tipo `DeterministicScoreResult` con la misma forma de datos, sin cambios en la firma ni en los tipos exportados

3.6 WHEN `savePersonalFit` persiste `pfit_sales_comfort_score`, `pfit_uncertainty_comfort_score`, `pfit_work_preference`, `pfit_enjoyed_activities` y `pfit_hiring_preference` THEN el sistema SHALL CONTINUE TO escribir esos campos correctamente en `personal_fit_answers`

3.7 WHEN el tipo `profileSchema` de Zod valida los campos obligatorios existentes THEN el sistema SHALL CONTINUE TO requerir `currentSituation`, `mainGoal` y `entrepreneurshipExperience` como campos obligatorios; `capitalRange` y `acceptableLossRange` serán opcionales

---

## Bug Condition Pseudocode

### Función de condición de bug

```pascal
FUNCTION isBugCondition(assessment)
  INPUT: assessment of type AssessmentWithRelations
  OUTPUT: boolean
  
  // El bug se activa cuando el campo que determina el riesgo no fue recopilado
  RETURN assessment.assessment_profile.aprf_acceptable_loss_range = null
    AND assessment.assessment_profile.aprf_capital_available_range = null
END FUNCTION
```

### Propiedad: Fix Checking

```pascal
// Property: Fix Checking — riskScore refleja tolerancia real al riesgo
FOR ALL assessment WHERE isBugCondition(assessment) IS FALSE DO
  result ← calculateDeterministicScores'(assessment)
  riskDimension ← result.dimensions.find(d => d.key = "risk_level")
  
  // Un usuario con pérdida aceptable < $5k e inversión de $50k debe obtener riesgo bajo
  IF assessment.assessment_profile.aprf_acceptable_loss_range = "menos_5k"
    AND assessment.financial_inputs.finp_initial_investment >= 50000 THEN
    ASSERT riskDimension.score <= 35
  END IF
END FOR
```

### Propiedad: Preservation Checking

```pascal
// Property: Preservation Checking — assessments sin el dato nuevo no se rompen
FOR ALL assessment WHERE isBugCondition(assessment) DO
  result ← calculateDeterministicScores'(assessment)
  ASSERT result IS NOT NULL
  ASSERT result.dimensions.length = 6
  ASSERT NO_RUNTIME_ERROR
END FOR
```
