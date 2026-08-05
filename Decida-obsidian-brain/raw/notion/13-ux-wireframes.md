---
source: notion
title: "🎨 13 - UX Wireframes"
url: https://app.notion.com/p/37d09ab888ba81beb962d05748ea24e3
fetched: 2026-08-05
---

## Purpose
Definir la experiencia pantalla por pantalla antes de desarrollar. UX Principle: se debe sentir como una mini-consultoría interactiva, no una encuesta larga.

## Screens (V1 diseño original)
1. **Landing Page** — hero, problem statement, qué analiza, cómo funciona, ejemplo de resultado, pricing, FAQ, CTA final.
2. **Payment/Start** — decisión: cobrar antes del cuestionario (recomendado para beta a $99 MXN) vs cobrar después de un teaser.
3. **Intro to Assessment** — expectativas: no necesitas datos perfectos, usa estimaciones, el reporte no reemplaza asesoría.
4. **User Profile** — situación, objetivo, horizonte de ingreso, experiencia.
5. **Resources** — capital, pérdida aceptable, horas/semana, horario.
6. **Personal Fit** — actividades que disfruta/evita, preferencia físico/digital, comodidad vendiendo/incertidumbre.
7. **Business Idea Input** — describe tu idea, cliente ideal, problema, por qué pagarían.
8. **AI Idea Confirmation** — card "Entendimos tu idea así" con botones Confirmar / Editar. Pantalla clave para personalización percibida.
9. **Financial Basics** — inversión, precio, costo, ventas estimadas, costos fijos, con tooltips de ayuda.
10. **Market and Risk** — validación con clientes, competencia, canal, dependencias, preocupación principal.
11. **Loading/Analysis** — copy de expectativa mientras se genera el diagnóstico.
12. **Results Overview** — recomendación + diagnóstico de 3 líneas arriba del fold; NO empezar con score numérico global.
13. **Full Report** — todas las secciones del reporte + CTA "Descargar PDF".
14. **PDF Download/Email** — descargar, enviar a correo, copiar resumen.
15. **Upsell** — Plan Pro / agendar revisión / no por ahora.

## Mobile UX Considerations
Mobile-first aunque no haya app: una pregunta por pantalla, botones grandes, progreso visible, guardar respuestas localmente, evitar tablas complejas en resultado mobile.

## UX Success Criteria
Entender la promesa en <10s · completar cuestionario en 10-15 min · sentir personalización antes del resultado · resultado claro sin saturar · PDF percibido como entregable real.

> Nota de brecha: el flujo implementado agrupa/renombra pasos distinto — ver `contacto → idea → confirmacion → pago → perfil → ajuste → evaluacion → resultado` en [[flujo-de-onboarding]]. La idea y su confirmación IA ocurren **antes** del pago (fase gratis), no después.
