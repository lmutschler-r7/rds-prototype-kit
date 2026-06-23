# Page Steering (Index)

Use this folder as the default Copilot steering source for page work.

## Repository Scope
1. Treat the files in `.ai-steering/` as repository-shared guidance, not conversation-local context.
2. Any user or agent pulling this repository should be able to follow these files without relying on prior chat history.
3. When page conventions change during implementation, update the relevant `.ai-steering/` files so the repo remains self-describing.
4. Do not keep critical page-building rules only in transient prompts, summaries, or chat context when they affect future contributors.

## Modes
1. Build mode: follow `.ai-steering/page-rules-build.md`
2. Audit mode: follow `.ai-steering/page-rules-audit.md`

## Prompt Suffixes
1. Build prompt suffix:
	Follow `.ai-steering/page-rules-build.md` exactly.
2. Audit prompt suffix:
	Audit this page using `.ai-steering/page-rules-audit.md`.

## Template Source
1. Template definitions and component outlines live in `.ai-steering/page-templates.md`.
2. Build and audit workflows must classify page type using `.ai-steering/page-templates.md` before applying rule checks.

## Alignment Note
1. Build, audit, and template guidance are aligned with implemented patterns from `Findings`, `Alerts`, `Response & Remediation`, and `VulnerabilityDetail`.
2. Dashboard guidance is also aligned with the implemented `CommandHome` dashboard work, including token-family selection, KPI usage, and non-cartesian chart configuration rules.
3. Dashboard guidance now also captures iteration learnings from the `CommandHome` refinement loop:
	- card header standardization,
	- DataGrid-in-card flattening,
	- severity/status/priority chip+icon table semantics,
	- explicit sticky/non-sticky tab behavior checks,
	- and ECharts example-driven radar/funnel implementation checks.
4. If guidance appears to conflict during implementation, treat `.ai-steering/page-templates.md` as canonical and report the conflict in outputs.

## Non-Negotiables
1. Prefer `@rapid7/rds` and `@rapid7/rds-labs` components over custom UI wrappers.
2. Use theme tokens (`theme.palette.*`, `theme.shadows[]`) for visual primitives.
3. Prioritize intentional non-default styling and clear override strategy over stock component appearance.
4. Keep light/dark mode behavior valid by default.
5. Keep nav/header/content layering predictable and explicit.
6. Treat unresolved required gaps as blockers, not assumptions.
7. Treat accessibility conformance as low-emphasis for PoC unless explicitly required by the prompt.
8. Never add `slotProps` overrides to `CardHeader` (or any component) to change `variant`, `color`, `fontWeight`, or `sx` on internal slots — use the component's default styling. This applies to all cards, now and in the future.