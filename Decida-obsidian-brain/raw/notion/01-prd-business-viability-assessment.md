---
source: notion
title: "📄 01 - PRD | Business Viability Assessment"
url: https://app.notion.com/p/37d09ab888ba819a9e3ef84c3b9b25dc
fetched: 2026-08-05
---

## Product Name
Business Viability Assessment

## One-liner
Herramienta web que ayuda a una persona a evaluar si una idea de negocio vale la pena para ella antes de invertir tiempo, dinero o esfuerzo.

## Product Vision
Convertir la incertidumbre inicial de una idea de negocio en claridad accionable mediante un diagnóstico personalizado de viabilidad, riesgo, compatibilidad personal y próximos pasos.

## Core Positioning
No es una lista de negocios recomendados. No es una plantilla genérica. No es un curso de emprendimiento. Es un sistema de evaluación para cualquier idea de negocio que el usuario ya tenga en mente.

## Problem Statement
Muchas personas quieren iniciar un negocio por necesidad, curiosidad, deseo de libertad financiera o búsqueda de ingreso adicional. Sin embargo, suelen evaluar sus ideas de forma emocional, incompleta o influenciada por tendencias.

Errores más comunes:
- Subestimar inversión inicial.
- No calcular costos operativos.
- No validar demanda.
- Sobreestimar ventas.
- Ignorar cuánto tiempo requiere operar el negocio.
- Elegir una idea que no encaja con su estilo de vida.
- Confundir autoempleo con negocio escalable.

## Target User
Personas con empleo o ingresos actuales que están considerando iniciar un negocio secundario, validar una idea o invertir capital limitado en una oportunidad.

### Perfil inicial ideal
- Tiene una o varias ideas en mente.
- No sabe cuál conviene más.
- Tiene miedo de perder dinero.
- Tiene tiempo limitado.
- Quiere claridad antes de invertir.
- Está dispuesta a pagar poco por un diagnóstico inmediato.

## Jobs To Be Done
- Cuando tengo una idea de negocio y no sé si vale la pena, quiero analizarla con criterios objetivos para decidir si debo avanzar, ajustar la idea o descartarla.
- Cuando tengo capital limitado, quiero saber qué tan riesgosa es mi idea antes de gastar dinero.
- Cuando tengo empleo, quiero saber si mi idea cabe en mis horarios y si realmente podría crecer.

## Main User Questions
- ¿Con mis recursos actuales, esta idea tiene sentido?
- ¿Cuál es el mayor riesgo que no estoy viendo?
- ¿Cuánto tendría que vender para recuperar mi inversión?
- ¿Este negocio cabe en mis horarios?
- ¿Estoy creando un negocio o un autoempleo?
- ¿Qué debería validar primero antes de invertir más?

## MVP Goal
1. Pagar o iniciar un análisis.
2. Contestar un onboarding guiado.
3. Describir su idea de negocio.
4. Recibir un diagnóstico inmediato con IA barata.
5. Descargar o visualizar un reporte simple.
6. Entender sus próximos pasos.

## MVP Success Criteria
- El usuario completa el cuestionario sin confundirse.
- El resultado se percibe personalizado.
- El diagnóstico identifica riesgos útiles.
- El usuario recibe próximos pasos accionables.
- Al menos 10 personas pagan por usarlo.
- Al menos 3 personas dicen que el análisis les mostró algo que no habían considerado.

## Non-goals V1
App móvil · Login completo · Dashboard complejo · Historial de evaluaciones · Comunidad · Comparador de múltiples negocios · Marketplace · Curso · Base de negocios preestudiados.

> Nota de brecha (ver [[evolucion-del-producto]]): varios de estos non-goals ya fueron superados en el código actual — hay login ligero (verificación por email) e historial (`/mis-evaluaciones`).

## Product Experience
Debe sentirse como una mini-consultoría inmediata. El usuario termina con: Claridad, Confianza, Acción.

## Primary Output
Reporte de viabilidad con: resumen ejecutivo, diagnóstico general, semáforos por dimensión, fortalezas, riesgos, supuestos críticos, próximos pasos, recomendación final.

## Pricing Initial Hypothesis
- **Starter** $99 MXN — resultado inmediato básico y reporte simple.
- **Pro** $299 MXN — reporte más detallado, PDF descargable, recomendaciones más completas.
- **Expert** $799–$999 MXN — revisión personalizada o sesión de 30 minutos.

## Initial Tech Hypothesis
Next.js · TypeScript · Formulario multi-step · Motor de scoring en JSON/reglas · IA barata para redacción del diagnóstico · Stripe o Mercado Pago · PDF básico generado en servidor · Sin login en V1.

## Strategic Risk
El mayor riesgo no es técnico. El mayor riesgo es construir demasiada funcionalidad antes de confirmar que la gente paga por reducir incertidumbre sobre una idea de negocio.
