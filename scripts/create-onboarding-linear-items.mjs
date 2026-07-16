#!/usr/bin/env node
/**
 * Create onboarding milestone + issue in Linear (project Decida).
 *
 * Usage:
 *   LINEAR_API_KEY=lin_api_xxx node scripts/create-onboarding-linear-items.mjs
 */

const API_URL = "https://api.linear.app/graphql";

const apiKey = process.env.LINEAR_API_KEY;
if (!apiKey) {
  console.error("Error: LINEAR_API_KEY no está definida.");
  console.error(
    "Genera una en Linear → Settings → Account → Security & Access → Personal API keys"
  );
  process.exit(1);
}

async function graphql(query, variables = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data;
}

async function findProject(name) {
  const data = await graphql(`
    query {
      projects(first: 50) {
        nodes { id name }
      }
    }
  `);
  const project = data.projects.nodes.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  if (!project) {
    throw new Error(
      `Proyecto "${name}" no encontrado. Disponibles: ${data.projects.nodes.map((p) => p.name).join(", ")}`
    );
  }
  return project;
}

async function findTeam(name) {
  const data = await graphql(`
    query {
      teams {
        nodes { id name key }
      }
    }
  `);
  const team = data.teams.nodes.find(
    (t) => t.name.toLowerCase() === name.toLowerCase() || t.key.toLowerCase() === name.toLowerCase()
  );
  if (!team) {
    throw new Error(
      `Equipo "${name}" no encontrado. Disponibles: ${data.teams.nodes.map((t) => t.key).join(", ")}`
    );
  }
  return team;
}

const MILESTONE = {
  name: "Onboarding — pruebas y mejoras",
  description:
    "Recorrer el flujo completo de `/analizar`, corregir fricción UX y mejorar la calidad del diagnóstico y la página de resultado. Punto de partida para iterar el onboarding antes de lanzar.",
};

const ISSUE = {
  title: "Pruebas end-to-end y mejoras del onboarding y análisis de resultado",
  priority: 2,
  description: `## Objetivo
Validar el flujo completo de onboarding con escenarios reales, documentar hallazgos y aplicar mejoras en UX, IA y página de resultado.

## Alcance de pruebas
- [ ] Recorrer manualmente los 8 pasos: contacto → idea → confirmación → pago → perfil → ajuste → evaluación → resultado
- [ ] Probar con al menos 3 tipos de idea distintos (físico, digital, servicios)
- [ ] Verificar reanudación de sesión (cookie) y guard de navegación secuencial
- [ ] Ejecutar \`e2e/onboarding.spec.ts\` y \`e2e/onboarding-ux-audit.spec.ts\`
- [ ] Revisar calidad del resumen IA, supuestos y refinamiento en confirmación
- [ ] Evaluar utilidad del reporte: semáforos, narrativa, plan de validación, recomendación vs. \`/ejemplo\`

## Mejoras a identificar
- Fricción por paso (copy, tiempos de carga, errores de validación)
- Loading states (idea, evaluación, generación de reporte)
- Calidad percibida del análisis
- Bugs o regresiones encontrados en la prueba

## Entregable
Documento de hallazgos + lista de issues derivadas para el milestone **Onboarding — pruebas y mejoras**.

## Archivos clave
- \`src/app/analizar/\`
- \`src/components/onboarding/\`
- \`e2e/onboarding.spec.ts\`
- \`e2e/onboarding-ux-audit.spec.ts\`
`,
};

async function main() {
  console.log('Buscando proyecto "Decida"...');
  const project = await findProject("Decida");
  console.log(`Proyecto: ${project.name}`);

  console.log('Buscando equipo "Decida"...');
  const team = await findTeam("Decida");
  console.log(`Equipo: ${team.name} (${team.key})`);

  console.log(`Creando milestone "${MILESTONE.name}"...`);
  const milestoneData = await graphql(
    `mutation ProjectMilestoneCreate($input: ProjectMilestoneCreateInput!) {
      projectMilestoneCreate(input: $input) {
        success
        projectMilestone { id name url }
      }
    }`,
    {
      input: {
        projectId: project.id,
        name: MILESTONE.name,
        description: MILESTONE.description,
      },
    }
  );

  const milestone = milestoneData.projectMilestoneCreate.projectMilestone;
  if (!milestoneData.projectMilestoneCreate.success) {
    throw new Error("No se pudo crear el milestone");
  }
  console.log(`Milestone creado: ${milestone.url}`);

  console.log(`Creando issue "${ISSUE.title}"...`);
  const issueData = await graphql(
    `mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier title url }
      }
    }`,
    {
      input: {
        teamId: team.id,
        projectId: project.id,
        projectMilestoneId: milestone.id,
        title: ISSUE.title,
        description: ISSUE.description,
        priority: ISSUE.priority,
      },
    }
  );

  const issue = issueData.issueCreate.issue;
  if (!issueData.issueCreate.success) {
    throw new Error("No se pudo crear la issue");
  }

  console.log("\nListo:");
  console.log(`  Milestone: ${milestone.url}`);
  console.log(`  Issue: ${issue.url} (${issue.identifier})`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
