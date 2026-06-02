# Page Build Rules (Compressed)

## Intent
Generate pages as a compiler-like pipeline, not freeform UI design.
This project is prototype-first: prioritize visual direction, non-default component treatment, and fast iteration over production-hardening concerns.

## Build Sequence
1. Resolve task intent and target page type.
2. Define/confirm required contracts before coding.
3. Build a page spec (or equivalent explicit plan).
4. Validate component + token + styling-override + access + routing assumptions.
5. Implement page.
6. Run diagnostics and build.

## Component Policy
1. Use RDS and RDS-labs primitives first.
2. For findings-style pages, default to:
   - `DetailsPageHeader`
   - `KpiContainer` + `Kpi`
   - `FilterBar`
   - `DataGridTable`
3. Avoid custom wrappers when a library component exists.
4. Prefer direct component props (`sx`, spacing props, slot props) over extra `Box` wrappers.
5. Do not wrap `DataGridTable` in decorative `Box` borders/background shells unless explicitly required.
6. `DataGridTable` with `isClientSide={true}`:
   - Set `totalCount` to the displayed row set length (for example `filteredRows.length`) so toolbar result counts stay accurate.
   - Do not rely on MUI client-side `rowCount` warnings as a reason to remove `totalCount`; in this codebase `totalCount` is used for table title/toolbar count display.
   - Omit `checkboxSelectionVisibleOnly` prop in page code; DataGridTable wrapper manages this internally.
7. Place top-level page actions in `DetailsPageHeader` action slots when the header is present.
   - Buttons in header slots must use `size="medium"` and include a related icon.
   - Icon selection:
     - Create/add actions: use `AddPlusUnbound` (unbounded plus icon for open/flexible creation)
     - Report/documentation actions: use `Reporting` (for report-specific create/generate workflows)
     - Refer to `.ai-steering/icon-reference.md` for additional icon guidance.
8. For tab-based section layouts, use `Tabs` + `TabPanel` structure.

## Theming Policy
1. In pages, use `useTheme<Theme>()`.
2. Use `theme.palette.*` and `theme.shadows[]` for colors/elevation.
3. No hardcoded visual color literals unless no token exists.
4. If SVG should follow theme text color, render inline/injected SVG with `currentColor` and set wrapper color to `theme.palette.text.primary`.

## Styling Override Policy (Prototype Priority)
1. Do not ship default-looking screens. Apply intentional visual customization to RDS/RDS-labs components.
2. Prefer token-driven overrides via `sx` and component slot props (for example headers, rows, cards, tabs, filter containers).
3. Override choices should create a coherent visual hierarchy (emphasis, density, contrast, spacing rhythm), not random one-off tweaks.
4. If a page keeps mostly defaults, treat it as incomplete unless explicitly requested.

## Layout and Layering
1. Nav is highest layer.
2. Sticky header is above page content/filters but below nav.
3. Sticky regions require explicit z-index and token-based background.
4. Keep layout wrappers minimal; remove non-essential `Box` containers when the same result can be achieved on the target component.
5. Enforce consistent 16px vertical spacing throughout pages:
   - Between KPI regions and subsequent filter/control rows (`spacing={2}`).
   - Between FilterBar and DataGridTable using a single parent layout rhythm (`Stack spacing={2}` preferred) so spacing cannot regress.
   - If `Stack spacing={2}` is not used, apply exactly one explicit 16px gap rule (`mb: '16px'` on FilterBar or `mt: '16px'` on table), not both.
   - Between filter/control rows and data regions.
   - Between distinct content blocks within TabPanel sections.
6. Apply `mb: '16px'` to Tabs when they are the primary page section dividers.

## Data and Clarity
1. Keep mock data deterministic.
2. Use neutral field names for multi-type templates (for example `identifier`).
3. Keep file order predictable: constants, types, helpers, component.
4. Prefer helper renderers over repeated inline JSX.
5. Do not add manual result-count labels above `DataGridTable` when the grid already provides built-in result counts/search context.
6. Table cell alignment standard:
   - text/categorical values: left horizontal alignment + vertical center
   - numeric values: right horizontal alignment + vertical center

## Access Rules
1. Apply persona visibility/actions before rendering fields/actions.
2. Never expose restricted fields for the wrong persona.

## Accessibility Expectations (PoC Scope)
1. Accessibility is a low-emphasis check for prototypes.
2. Keep only obvious no-cost basics when practical (for example button labels when already wiring actions).
3. Do not block prototype delivery on full accessibility conformance unless explicitly requested.

## Output Requirements
Return:
1. Files changed.
2. Components used.
3. Token usage approach.
4. Styling override strategy (what was intentionally changed from defaults and why).
5. Persona/access rules applied.
6. Remaining gaps/assumptions.
7. Validation status (`get_errors`, build result).

## Stop Conditions
1. Missing required contract data.
2. Contradictory requirements with no clear authority.
3. Unknown required route/access rule that would change behavior.