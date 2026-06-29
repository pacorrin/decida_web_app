# Skills Installed — UI/UX Architecture

Curated agent skills for **Decida** enterprise SaaS (Next.js 16, React 19, TypeScript, shadcn/ui, Tailwind, Sass).

**Scope:** User-level (`~/.cursor/skills`) — available in all Cursor projects  
**Installed via:** `gh skill install <repo> <skill> --agent cursor --scope user`  
**Date:** 2026-06-26  
**gh CLI:** upgraded to v2.95.0 (required for `gh skill`)

---

## Priority Coverage Map

| Priority | Primary Skills |
|----------|----------------|
| SaaS Dashboard | `shadcn`, `ui-styling`, `layout-paradigms-and-consistency`, `global-toolbar-controls`, `metrics-dashboard` |
| UX Research | `lean-ux-canvas`, `problem-framing-canvas`, `nielsen-usability-heuristics` |
| UI Design | `frontend-design`, `taste-skill`, `design`, `baseline-ui` |
| shadcn/ui | `shadcn`, `ui-styling` |
| Design System | `design-system`, `component-family-consistency`, `color-mode-and-theme` |
| React Components | `composition-patterns`, `react-best-practices`, `shadcn` |
| Accessibility | `accessibility`, `wcag-accessibility`, `fixing-accessibility` |
| Forms | `form-design`, `shadcn` (rules/forms.md) |
| Tables | `data-display-and-selection`, `ui-styling` |
| Wizard Builder | `user-flows-and-guided-paths` |
| Analytics Dashboard | `metrics-dashboard`, `ui-styling` |
| Empty States | `loading-states-and-perceived-performance`, `notifications-and-recovery` |
| UX Writing | `copywriting`, `writing-guidelines` |
| Responsive Layouts | `responsive-paradigms`, `web-design-guidelines`, `layout-paradigms-and-consistency` |

---

## Core Skills (★★★★★)

### 1. shadcn

| Field | Value |
|-------|-------|
| **Repository** | [shadcn/ui](https://github.com/shadcn/ui) |
| **Stars** | 117,510 |
| **Purpose** | Official shadcn/ui skill — component discovery, CLI install, composition, forms, theming, and project-aware `components.json` context |
| **Example usage** | *"Add a CRM dashboard with sidebar, stats cards, and a data table using shadcn/ui"* |
| **Command** | `gh skill install shadcn/ui shadcn --agent cursor --scope user` |

---

### 2. ui-styling

| Field | Value |
|-------|-------|
| **Repository** | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| **Stars** | 96,865 |
| **Purpose** | shadcn/ui + Tailwind styling, responsive layouts, accessible dialogs/forms/tables, dark mode, design tokens |
| **Example usage** | *"Build a Treasury module with shadcn Card, Chart, and Table — responsive and accessible"* |
| **Command** | `gh skill install nextlevelbuilder/ui-ux-pro-max-skill ui-styling --agent cursor --scope user` |

---

### 3. design-system

| Field | Value |
|-------|-------|
| **Repository** | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| **Stars** | 96,865 |
| **Purpose** | Token architecture, semantic/primitive tokens, component specs, Tailwind integration, states & variants |
| **Example usage** | *"Define design tokens for our CRM: primary, destructive, sidebar, chart colors"* |
| **Command** | `gh skill install nextlevelbuilder/ui-ux-pro-max-skill design-system --agent cursor --scope user` |

---

### 4. frontend-design

| Field | Value |
|-------|-------|
| **Repository** | [anthropics/skills](https://github.com/anthropics/skills) |
| **Stars** | 155,568 |
| **Purpose** | Distinctive UI design — palette, typography, layout, anti-template aesthetics for SaaS surfaces |
| **Example usage** | *"Design a Tender Marketplace listing page that doesn't look like generic AI slop"* |
| **Command** | `gh skill install anthropics/skills frontend-design --agent cursor --scope user` |

---

### 5. taste-skill

| Field | Value |
|-------|-------|
| **Repository** | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) |
| **Stars** | 51,576 |
| **Purpose** | High-agency frontend taste — tunable design variance, motion intensity, visual density |
| **Example usage** | *"Refine the Commissions dashboard with restrained motion and enterprise density"* |
| **Command** | `gh skill install Leonxlnx/taste-skill taste-skill --agent cursor --scope user` |

---

### 6. composition-patterns

| Field | Value |
|-------|-------|
| **Repository** | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| **Stars** | 28,360 |
| **Purpose** | React 19 component architecture — compound components, explicit variants, state lifting, no forwardRef |
| **Example usage** | *"Refactor ServiceTicketCard into compound components with clean state boundaries"* |
| **Command** | `gh skill install vercel-labs/agent-skills composition-patterns --agent cursor --scope user` |

---

### 7. react-best-practices

| Field | Value |
|-------|-------|
| **Repository** | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| **Stars** | 28,360 |
| **Purpose** | Vercel React/Next.js performance patterns — Suspense, bundle optimization, async routes |
| **Example usage** | *"Optimize the Reporting dashboard for faster initial load with Suspense boundaries"* |
| **Command** | `gh skill install vercel-labs/agent-skills react-best-practices --agent cursor --scope user` |

---

### 8. accessibility

| Field | Value |
|-------|-------|
| **Repository** | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) |
| **Stars** | 2,429 |
| **Purpose** | WCAG compliance, screen reader support, keyboard navigation (Google Chrome team patterns) |
| **Example usage** | *"Audit the Payments checkout form for WCAG 2.2 AA compliance"* |
| **Command** | `gh skill install addyosmani/web-quality-skills accessibility --agent cursor --scope user` |

---

### 9. wcag-accessibility

| Field | Value |
|-------|-------|
| **Repository** | [dembrandt/dembrandt-skills](https://github.com/dembrandt/dembrandt-skills) |
| **Stars** | 20 |
| **Purpose** | WCAG-focused UI patterns for enterprise components |
| **Example usage** | *"Ensure Organization settings meet WCAG contrast and focus requirements"* |
| **Command** | `gh skill install dembrandt/dembrandt-skills wcag-accessibility --agent cursor --scope user` |

---

### 10. fixing-accessibility

| Field | Value |
|-------|-------|
| **Repository** | [ibelick/ui-skills](https://github.com/ibelick/ui-skills) |
| **Stars** | 3,402 |
| **Purpose** | Fix common a11y issues in React/shadcn interfaces |
| **Example usage** | *"Fix keyboard trap in the Ticket assignment dialog"* |
| **Command** | `gh skill install ibelick/ui-skills fixing-accessibility --agent cursor --scope user` |

---

### 11. form-design

| Field | Value |
|-------|-------|
| **Repository** | [dembrandt/dembrandt-skills](https://github.com/dembrandt/dembrandt-skills) |
| **Stars** | 20 |
| **Purpose** | Enterprise form UX — validation states, field grouping, error recovery |
| **Example usage** | *"Design a multi-step Commission payout form with inline validation"* |
| **Command** | `gh skill install dembrandt/dembrandt-skills form-design --agent cursor --scope user` |

---

### 12. data-display-and-selection

| Field | Value |
|-------|-------|
| **Repository** | [dembrandt/dembrandt-skills](https://github.com/dembrandt/dembrandt-skills) |
| **Stars** | 20 |
| **Purpose** | Data tables, grid/list views, row selection, bulk actions |
| **Example usage** | *"Build a CRM contacts table with sort, filter, row select, and bulk export"* |
| **Command** | `gh skill install dembrandt/dembrandt-skills data-display-and-selection --agent cursor --scope user` |

---

### 13. user-flows-and-guided-paths

| Field | Value |
|-------|-------|
| **Repository** | [dembrandt/dembrandt-skills](https://github.com/dembrandt/dembrandt-skills) |
| **Stars** | 20 |
| **Purpose** | Multi-step wizards, guided onboarding, progressive disclosure |
| **Example usage** | *"Create a 4-step wizard for new Organization setup (profile → users → billing → review)"* |
| **Command** | `gh skill install dembrandt/dembrandt-skills user-flows-and-guided-paths --agent cursor --scope user` |

---

### 14. metrics-dashboard

| Field | Value |
|-------|-------|
| **Repository** | [phuryn/pm-skills](https://github.com/phuryn/pm-skills) |
| **Stars** | 21,231 |
| **Purpose** | Product metrics dashboard definition — KPIs, sources, alert thresholds |
| **Example usage** | *"Define analytics dashboard for Treasury: cash flow, AR/AP, commission totals"* |
| **Command** | `gh skill install phuryn/pm-skills metrics-dashboard --agent cursor --scope user` |

---

### 15. loading-states-and-perceived-performance

| Field | Value |
|-------|-------|
| **Repository** | [dembrandt/dembrandt-skills](https://github.com/dembrandt/dembrandt-skills) |
| **Stars** | 20 |
| **Purpose** | Skeletons, spinners, empty states, perceived performance |
| **Example usage** | *"Add empty state for Tender Marketplace when no active tenders exist"* |
| **Command** | `gh skill install dembrandt/dembrandt-skills loading-states-and-perceived-performance --agent cursor --scope user` |

---

### 16. copywriting

| Field | Value |
|-------|-------|
| **Repository** | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| **Stars** | 35,104 |
| **Purpose** | UX writing for SaaS — microcopy, CTAs, error messages, onboarding text |
| **Example usage** | *"Write UX copy for Payment failure recovery and retry flow"* |
| **Command** | `gh skill install coreyhaines31/marketingskills copywriting --agent cursor --scope user` |

---

### 17. writing-guidelines

| Field | Value |
|-------|-------|
| **Repository** | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| **Stars** | 28,360 |
| **Purpose** | Clear, consistent UI text and documentation tone |
| **Example usage** | *"Standardize button labels and toast messages across CRM modules"* |
| **Command** | `gh skill install vercel-labs/agent-skills writing-guidelines --agent cursor --scope user` |

---

### 18. responsive-paradigms

| Field | Value |
|-------|-------|
| **Repository** | [dembrandt/dembrandt-skills](https://github.com/dembrandt/dembrandt-skills) |
| **Stars** | 20 |
| **Purpose** | Responsive breakpoints, mobile-first layouts, adaptive navigation |
| **Example usage** | *"Make the Service Tickets board responsive: sidebar collapses to sheet on mobile"* |
| **Command** | `gh skill install dembrandt/dembrandt-skills responsive-paradigms --agent cursor --scope user` |

---

### 19. web-design-guidelines

| Field | Value |
|-------|-------|
| **Repository** | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| **Stars** | 28,360 |
| **Purpose** | Web design standards, layout best practices, modern UI patterns |
| **Example usage** | *"Review dashboard layout against Vercel web design guidelines"* |
| **Command** | `gh skill install vercel-labs/agent-skills web-design-guidelines --agent cursor --scope user` |

---

### 20. lean-ux-canvas

| Field | Value |
|-------|-------|
| **Repository** | [deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills) |
| **Stars** | 5,409 |
| **Purpose** | Hypothesis-driven UX research using Jeff Gothelf's Lean UX Canvas |
| **Example usage** | *"Run Lean UX Canvas for the Tender Marketplace MVP hypothesis"* |
| **Command** | `gh skill install deanpeters/Product-Manager-Skills lean-ux-canvas --agent cursor --scope user` |

---

### 21. frontend-design-review

| Field | Value |
|-------|-------|
| **Repository** | [microsoft/skills](https://github.com/microsoft/skills) |
| **Stars** | 2,618 |
| **Purpose** | Structured frontend design review checklist and output format |
| **Example usage** | *"Review the CRM dashboard UI before release"* |
| **Command** | `gh skill install microsoft/skills frontend-design-review --agent cursor --scope user --allow-hidden-dirs` |

---

## Supporting Skills (installed)

| Skill | Repository | Stars | Purpose |
|-------|------------|-------|---------|
| `baseline-ui` | ibelick/ui-skills | 3,402 | Baseline UI constraints for agents |
| `design` | nextlevelbuilder/ui-ux-pro-max-skill | 96,865 | General UI/UX design patterns |
| `brand` | nextlevelbuilder/ui-ux-pro-max-skill | 96,865 | Brand guidelines and visual identity |
| `web-quality-audit` | addyosmani/web-quality-skills | 2,429 | Lighthouse-style quality audit |
| `problem-framing-canvas` | deanpeters/Product-Manager-Skills | 5,409 | UX problem framing (MITRE method) |
| `layout-paradigms-and-consistency` | dembrandt/dembrandt-skills | 20 | Dashboard layout consistency |
| `global-toolbar-controls` | dembrandt/dembrandt-skills | 20 | App shell, nav, toolbar patterns |
| `information-architecture` | dembrandt/dembrandt-skills | 20 | IA for complex SaaS modules |
| `component-family-consistency` | dembrandt/dembrandt-skills | 20 | Cross-module component consistency |
| `color-mode-and-theme` | dembrandt/dembrandt-skills | 20 | Light/dark theme tokens |
| `notifications-and-recovery` | dembrandt/dembrandt-skills | 20 | Toasts, alerts, error recovery UX |
| `nielsen-usability-heuristics` | dembrandt/dembrandt-skills | 20 | Nielsen heuristic evaluation |
| `visual-emphasis-and-hierarchy` | dembrandt/dembrandt-skills | 20 | Visual hierarchy for dashboards |
| `ui-density` | dembrandt/dembrandt-skills | 20 | Enterprise data density tuning |
| `micro-interactions` | dembrandt/dembrandt-skills | 20 | Subtle feedback and transitions |
| `status-colors-and-errors` | dembrandt/dembrandt-skills | 20 | Semantic status colors |
| `sticky-and-fixed-elements` | dembrandt/dembrandt-skills | 20 | Sticky headers, action bars |
| `scroll-areas` | dembrandt/dembrandt-skills | 20 | Scrollable panels in dense UIs |
| `performance-and-web-vitals` | dembrandt/dembrandt-skills | 20 | UI performance patterns |
| `core-web-vitals` | addyosmani/web-quality-skills | 2,429 | LCP, INP, CLS optimization |
| `find-skills` | vercel-labs/skills | — | Discover additional skills |

---

## Full Install Commands (batch)

```bash
# Upgrade gh CLI first (requires v2.90+)
brew upgrade gh

# Core UI/UX stack
gh skill install shadcn/ui shadcn --agent cursor --scope user -f
gh skill install anthropics/skills frontend-design --agent cursor --scope user -f
gh skill install Leonxlnx/taste-skill taste-skill --agent cursor --scope user -f
gh skill install nextlevelbuilder/ui-ux-pro-max-skill --agent cursor --scope user --all -f
gh skill install ibelick/ui-skills --agent cursor --scope user --all -f
gh skill install dembrandt/dembrandt-skills --agent cursor --scope user --all -f
gh skill install addyosmani/web-quality-skills --agent cursor --scope user --all -f
gh skill install vercel-labs/agent-skills --agent cursor --scope user --all -f
gh skill install microsoft/skills frontend-design-review --agent cursor --scope user --allow-hidden-dirs -f
gh skill install deanpeters/Product-Manager-Skills lean-ux-canvas --agent cursor --scope user -f
gh skill install deanpeters/Product-Manager-Skills problem-framing-canvas --agent cursor --scope user -f
gh skill install coreyhaines31/marketingskills copywriting --agent cursor --scope user -f
gh skill install phuryn/pm-skills metrics-dashboard --agent cursor --scope user -f
```

---

## Install Location

```
~/.cursor/skills/
├── shadcn/
├── ui-styling/
├── design-system/
├── frontend-design/
├── taste-skill/
├── accessibility/
├── form-design/
├── data-display-and-selection/
├── user-flows-and-guided-paths/
├── metrics-dashboard/
├── copywriting/
├── responsive-paradigms/
└── ... (68 skills total)
```

---

## Maintenance

```bash
# List installed skills
ls ~/.cursor/skills

# Preview a skill before use
gh skill preview shadcn/ui shadcn

# Update all installed skills
gh skill update --all

# Search for new skills
gh skill search "dashboard shadcn"
npx skills find "dashboard ui"
```

---

## Notes

- Skills are **not verified by GitHub** — review `SKILL.md` before trusting scripts.
- Backend-only skills were intentionally excluded.
- `dembrandt/dembrandt-skills` has low GitHub stars but high UX specificity for enterprise SaaS patterns.
- For project-level skills (shared with team via git), re-run with `--scope project` inside the repo.
