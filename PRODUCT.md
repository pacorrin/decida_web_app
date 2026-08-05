# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are people with a main job who want to start a business, or people who already run a business and want to scale—focused on **one idea at a time**.

They arrive when they need to evaluate whether a specific business idea is viable and whether it is worth risking their time and effort under their **current conditions and constraints** (income, schedule, capital, risk tolerance, goals).

Secondary audiences implied by the product (not primary): freelancers, students, and others comparing a single opportunity—same job: decide whether to proceed, adjust, or pause.

## Product Purpose

Decida is a **business viability assessment**: a guided diagnostic that helps someone evaluate one business idea before investing more time and money.

It exists to reduce uncertainty—not to invent ideas, guarantee success, or replace specialized legal, fiscal, or financial advice.

**Success (user, level 1):** Leave with an informed decision—viable or not under their constraints—and feel they received strong, useful feedback that helped them decide.

**Success (product, level 2):** The feedback is valuable enough that they pay again to compare another idea they have in mind.

**Success (product, level 3):** After deciding to pursue an idea, they are ready to start executing and willing to buy a premium plan of tools that help them carry the idea forward. *(Premium tooling is a future offering; not required for V1.)*

## Positioning

Decida evaluates **the idea the user already has**, against their personal situation, resources, time, numbers, and market signals—then returns clear viability signals, risks, strengths, and concrete next steps.

It does **not** tell users which business to open. Neighboring “idea generators” or generic business coaches cannot truthfully claim the same constrained, idea-specific diagnostic loop.

## Operating Context

- Language and market framing: Spanish (Mexican Spanish tone in product copy); pricing and examples use MXN.
- Typical session: ~10–15 minutes through a multi-step onboarding under `/analizar`.
- Core loop: describe idea → confirm shared understanding → commit (paid diagnostic) → answer guided questions → receive report with dimension signals, risks, and validation plan.
- Users may return later via **Mis evaluaciones** to reopen completed diagnostics (email + verification).
- V1 focuses on **one idea per assessment**; comparing ideas is a later success path (repeat paid evaluations), not a built-in multi-idea comparator in the first pass.

## Capabilities and Constraints

**Confirmed capabilities (product):**
- Guided assessment flow and personalized report (executive summary, viability signals by dimension, strengths/risks, basic financial view, personal fit, validation next steps, final recommendation).
- Supports physical, digital, services, product, franchise, side hustle, and independent project ideas.
- Example report surface for preview before paying.
- Simulated beta payment (commitment step); refund promise if the report fails to generate.

**Constraints / non-goals:**
- No success guarantee.
- Not personalized legal, fiscal, or financial advisory.
- Not a “pick a business for me” product.
- Does not replace talking to real customers—high risk in the report should push validation or pause, not blind confidence.

**Open / undecided (do not invent):**
- Formal accessibility standard (e.g. WCAG level) not yet product-mandated beyond building a usable, friendly web app.
- Geographic expansion beyond Spanish/MX-first framing.
- Exact premium plan scope and pricing for level-3 success.
- Whether capital / loss-tolerance questions return in a later financial section (columns/options may still exist; UX was removed from the situation step).

## Brand Commitments

- **Name:** Decida.
- **Voice:** Friendly and easy to use—not elevated or overly technical—while remaining trustworthy and serious. Professional without being stiff or overly formal.
- Users must feel they can trust the feedback.
- Existing product framing on the marketing site: “Business Viability Assessment”; honesty about limits (no guarantees, no substitute for specialized advice).

## Evidence on Hand

- Marketing and product copy in `src/components/landing/` (problem, audience, FAQ, pricing beta $99 MXN, what the report includes).
- Runnable onboarding under `src/app/analizar/*` and example report under `/ejemplo`.
- History access under `/mis-evaluaciones`.
- Internal docs under `docs/` (implementation notes, flow diagrams)—engineering evidence, not customer proof.

**Do not fabricate:** customer testimonials, case studies, press, retention metrics, or independent benchmarks. None are confirmed as real evidence on hand.

## Product Principles

1. **One idea, real constraints** — Diagnose the user’s idea against their current situation; do not abstract away time, money, or risk.
2. **Clarity over theater** — Prefer honest signals, risks, and next steps over motivational fluff or false certainty.
3. **Decision-grade feedback** — Success is an informed proceed / adjust / pause choice, not a longer report for its own sake.
4. **Accessible language, credible judgment** — Sound approachable without sounding amateur; serious without sounding academic.
5. **Earn the next paid step** — Repeat evaluations and future premium tools must follow trust earned by the first diagnostic—not upsell before value.
