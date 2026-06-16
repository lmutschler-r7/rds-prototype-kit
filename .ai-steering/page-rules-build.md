# Page Build Rules (Compressed)

## Intent
Generate pages as a compiler-like pipeline, not freeform UI design.
This project is prototype-first: prioritize visual direction, non-default component treatment, and fast iteration over production-hardening concerns.

## Build Sequence
1. Resolve task intent and select template type using `.ai-steering/page-templates.md`.
2. Define/confirm required contracts before coding.
3. Build a page spec (or equivalent explicit plan).
4. Validate proposed structure against the selected template contract in `.ai-steering/page-templates.md`.
5. Run dashboard preflight checks (when template is `dashboard`) before implementation.
6. Implement page.
7. Run diagnostics and build.

## Dashboard Preflight (Required For `dashboard`)
1. Confirm tab model explicitly:
   - Tab labels and order.
   - Sticky behavior for page header and tab strip (`sticky` vs `non-sticky`).
   - Default active tab.
2. Confirm card header pattern before writing card content:
   - Use `CardHeader` (or approved local wrapper around `CardHeader`) for chart/table cards.
   - `title` required; `subheader`, `avatar`, and `action` optional.
3. Confirm KPI regions:
   - Use `KpiContainer` + `Kpi` for KPI-like summary rows.
   - Do not use ad-hoc value cards when content is value + label (+ optional delta).
4. Confirm CTA pattern:
   - Any "Go to ..." button uses a trailing chevron icon.
5. Confirm chart model by chart type:
   - Radar/funnel/pie/donut are non-cartesian.
   - If chart behavior should mirror a known ECharts example, capture the source example URL in task notes and adapt that option shape.
6. Confirm dashboard tables:
   - Use `DataGridTable`.
   - If placed inside a card, flatten nested table card border/shadow.
   - Severity/status/priority table cells use chip + impact icon.
7. Confirm token mapping:
   - Severity-driven visuals -> `semantic.status`.
   - Category-driven visuals -> `dataViz.categorical` in ascending steps starting at `10`.

## Template Contract Source
1. All template contracts live in `.ai-steering/page-templates.md`.
2. Treat `.ai-steering/page-templates.md` as canonical for component outlines and template scope constraints.
3. If build guidance here conflicts with `.ai-steering/page-templates.md`, follow `.ai-steering/page-templates.md` and report the conflict.

## Component Policy
1. Use RDS and RDS-labs primitives first.
2. For listing pages, follow the `listing` contract in `.ai-steering/page-templates.md`, including:
   - `DetailsPageHeader`
   - `KpiContainer` + `Kpi`
   - `FilterBar`
   - `DataGridTable`
3. Avoid custom wrappers when a library component exists.
4. Prefer direct component props (`sx`, spacing props, slot props) over extra `Box` wrappers.
5. Do not wrap `DataGridTable` in decorative `Box` borders/background shells unless explicitly required.
   - Dashboard exception: when `DataGridTable` is rendered inside a dashboard `Card`, you may wrap it to remove nested `DataGridTable` card chrome so the table appears integrated with the parent card.
   - In that exception, hide the nested table card border/shadow and remove the grid border.
6. `DataGridTable` with `isClientSide={true}`:
   - Set `totalCount` to the displayed row set length (for example `filteredRows.length`) so toolbar result counts stay accurate.
   - Do not rely on MUI client-side `rowCount` warnings as a reason to remove `totalCount`; in this codebase `totalCount` is used for table title/toolbar count display.
   - Omit `checkboxSelectionVisibleOnly` prop in page code; DataGridTable wrapper manages this internally.
   - Do not use the `title` prop in page implementations; rely on built-in toolbar/result context and slot-based count text where needed.
7. Place top-level page actions in `DetailsPageHeader` action slots when the header is present.
   - Buttons in header slots must use `size="medium"` and include a related icon.
   - Icon selection:
     - Create/add actions: use `AddPlusUnbound` (unbounded plus icon for open/flexible creation)
     - Report/documentation actions: use `Reporting` (for report-specific create/generate workflows)
     - Refer to `.ai-steering/icon-reference.md` for additional icon guidance.
8. For tab-based section layouts, use `Tabs` + `TabPanel` structure.
9. For dashboard tabular sections (for example top-N lists, policy/tag tables, SLA tables), prefer `DataGridTable` over ad-hoc `Box` table markup unless there is a documented exception.
10. Dashboard card headings:
   - Prefer `CardHeader` over standalone `Typography` title rows for dashboard chart/table cards.
   - If many cards are present, define a local shared header helper to keep spacing/typography consistent.
11. "Go to ..." CTA actions:
   - Use trailing chevron icon (`endIcon`) on the button.
   - Keep CTA phrasing verb-based and destination-specific.
12. Dashboard table semantics:
   - Columns named or functioning as severity/status/priority must render chip + impact icon, not plain text.
13. Runtime warning prevention:
   - Do not pass unsupported pointer-capture props to visual primitives (for example avatar wrappers) just to satisfy types.
   - If a library component forces problematic props, replace with a simple themed primitive implementation.
10. Listing page implementation guidance (from `Findings`, `Alerts`, `Response & Remediation`):
   - Use one parent `Stack spacing={2}` to enforce 16px rhythm between `FilterBar` and `DataGridTable`.
   - Keep `DataGridTable` controls local via table `slots` (`tableActions`, `batchActions`) instead of external wrapper toolbars when feasible.
   - Use deterministic filter-model parsing helpers for page-specific filter fields.
11. Details page implementation guidance (from `VulnerabilityDetail`):
   - Keep header-context metadata in `DetailsPageHeader` `slots.attributes`.
   - Use `Attribute` from `@rapid7/rds` for header attribute rows and avoid ad-hoc `Stack`/`Typography` replacements.
   - Keep title-adjacent status indicators (for example severity/CVSS chips, AI markers) in `DetailsPageHeader` `slots.tags`.
   - For detail-property rows in content cards, prefer `Attribute` with explicit `labelWidth` and token-backed `AttributeRootProps`/`LabelProps`.
   - For narrative intelligence content in details pages, `Card` with `variant="ai"` is the preferred optional treatment when AI-context content is present.

## Chart Implementation Policy
1. Before implementing or significantly customizing ECharts visuals, reference official ECharts docs/examples at `https://echarts.apache.org/examples` or related ECharts documentation.
2. Prefer adapting documented option patterns (for example funnel, radar, pie/doughnut composition) rather than inventing ad-hoc configuration structures.
3. When implementing a custom chart pattern, keep option objects explicit and readable so the source pattern is traceable in code review.
4. For donut center labels, prefer `graphic` text overlays in ECharts instead of relying on labels positioned at center when layout stability is needed.
5. For non-cartesian charts, do not spread a cartesian base object that includes `xAxis`/`yAxis`; use a dedicated base or explicit option object.

## Theming Policy
1. In pages, use `useTheme<Theme>()`.
2. Use `theme.palette.*` and `theme.shadows[]` for colors/elevation.
3. No hardcoded visual color literals unless no token exists.
4. If SVG should follow theme text color, render inline/injected SVG with `currentColor` and set wrapper color to `theme.palette.text.primary`.
5. When page work needs semantic or visualization-specific colors, prefer RDS token helpers over ad-hoc palette picks:
   - Use `getValue('semantic', theme.palette.brand, theme.palette.mode)` for status/severity-driven colors.
   - Use `getValue('dataViz', theme.palette.brand, theme.palette.mode)` for chart palettes and non-semantic series colors.
6. If a token helper requires a deep runtime import from `@rapid7/rds`, add a local declaration shim instead of falling back to hardcoded hex values.

## Dashboard Token Selection Policy
1. Severity, status, or risk semantics:
   - Use `semantic.status.*`.
   - Mapping default: `critical`, `high`, `medium`, `low`, `veryLow`, `healthy`.
2. General categorical chart colors:
   - Use `dataViz.categorical`.
   - Prefer these for donut segments, multi-series charts, generic bar/line colors, and non-severity categories.
   - When assigning ordered categorical colors, start at `10`, then `20`, then `30`, and continue upward in sequence.
   - If more categories are needed than the local sequence covers, continue upward before reusing values; only loop/reuse when the available categorical steps are exhausted.
3. Heatmap or density scales:
   - Use `dataViz.heatMap`.
   - Match the scale family to the meaning (`critical-*`, `high-*`, `warning-*`, `health-*`).
4. Positive/negative sentiment or binary good/bad states:
   - Use `dataViz.sentiment.positive` and `dataViz.sentiment.negative`.
   - This includes check/x icon color choices when the icon meaning is positive vs negative rather than severity.
5. Boolean states:
   - Use `dataViz.boolean.primary` or `dataViz.boolean.secondary`.
   - Use these for true/false visuals that are not severity badges.
6. Generic progress or completion bars with no stronger semantic meaning:
   - Use the primary brand color first.
   - If the bar is part of a chart series palette instead of a UI control, prefer a `dataViz.categorical` token.
7. KPI guidance:
   - Use `Kpi` and `KpiContainer` for KPI-style metrics instead of custom cards when the content is a value + label summary.
   - Use `detailSections` with `PERCENTAGE_CHANGE` for “compared to last period” deltas.
8. Do not mix token families arbitrarily within the same visualization.
   - If a chart is severity-driven, keep it on `semantic.status`.
   - If a chart is category-driven, keep it on `dataViz.categorical` unless one series has a clear semantic exception.
9. Keep categorical ordering stable across related visuals.
   - Default progression: `10 -> 20 -> 30 -> 40 -> 50 -> 60 -> 70 -> 80 -> 90 -> 100`.
   - Do not start category sequences from `100` and count downward unless a page has an explicit, documented reason.
10. Dashboard color consistency:
   - Within a dashboard tab, the same category should keep the same categorical step across cards when feasible.
   - Do not remap category colors card-to-card unless a card has a different semantic model.

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
7. Severity/status/priority fields in tables:
   - Render with `Chip` rather than plain text.
   - Include the appropriate Impact icon in the chip (`ImpactCritical`, `ImpactHigh`, `ImpactMedium`, `ImpactLow`, `ImpactVeryLow` as applicable).
8. Dashboard card internals:
   - If a card contains chart or table content, keep header spacing consistent (`CardHeader` followed by content region).
   - Avoid per-card one-off heading spacing tweaks unless required by content density.

## Dashboard Done Criteria
1. Tabs and sticky behavior match prompt exactly.
2. KPI-like items use `Kpi`/`KpiContainer`.
3. Chart/table cards use `CardHeader` (with optional sub props as needed).
4. Dashboard tables use `DataGridTable`; nested table card chrome removed when inside parent card.
5. Severity/status/priority cells use chip + impact icon.
6. "Go to ..." actions have trailing chevrons.
7. Non-cartesian chart config has no inherited cartesian axes.
8. Token family mapping is explicit and categorical order is ascending from `10`.

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