# Page Steering (Index)

Use this folder as the default Copilot steering source for page work.

## Modes
1. Build mode: follow `.ai-steering/page-rules-build.md`
2. Audit mode: follow `.ai-steering/page-rules-audit.md`

## Prompt Suffixes
1. Build prompt suffix:
	Follow `.ai-steering/page-rules-build.md` exactly.
2. Audit prompt suffix:
	Audit this page using `.ai-steering/page-rules-audit.md`.

## Non-Negotiables
1. Prefer `@rapid7/rds` and `@rapid7/rds-labs` components over custom UI wrappers.
2. Use theme tokens (`theme.palette.*`, `theme.shadows[]`) for visual primitives.
3. Prioritize intentional non-default styling and clear override strategy over stock component appearance.
4. Keep light/dark mode behavior valid by default.
5. Keep nav/header/content layering predictable and explicit.
6. Treat unresolved required gaps as blockers, not assumptions.
7. Treat accessibility conformance as low-emphasis for PoC unless explicitly required by the prompt.