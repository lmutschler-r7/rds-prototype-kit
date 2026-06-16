# Page Audit Rules (Compressed)

## Intent
Audit pages for prototype construction quality, component compliance, token use, and intentional non-default styling.
Accessibility conformance is low-emphasis in this repository unless explicitly requested.

## Audit Order
1. Validate selected template matches implemented structure using `.ai-steering/page-templates.md`.
2. Validate imports and component choices.
3. Validate token usage and styling sources.
4. Validate visual override depth and coherence (anything beyond defaults).
5. Validate persona/access behavior.
6. Validate routing/data binding assumptions.
7. Validate lightweight accessibility basics.

## Template Compliance
1. Require explicit template classification in audit summary.
2. Validate structure, scope, and required components against the selected template contract in `.ai-steering/page-templates.md`.
3. Treat template contract mismatches as findings:
   - High when required template components/scope are violated.
   - Medium when starter outline intent is partially met but structure drifts.
4. If any rule here conflicts with `.ai-steering/page-templates.md`, follow `.ai-steering/page-templates.md` and note conflict in findings.

## Component Compliance
1. Flag disallowed imports.
2. Flag components outside approved usage patterns.
3. Flag custom replacements when RDS/RDS-labs component exists.
4. Flag locally defined UI components for risk classification:
   - Medium risk: local presentational components that do not clearly map to an available RDS/RDS-labs primitive.
   - High risk: local components that replicate or wrap behavior available from an existing RDS/RDS-labs component without explicit justification.
5. When `DetailsPageHeader` is present, flag top-level page action controls rendered outside header action slots unless intentionally justified.
   - Flag header action buttons that are not `size="medium"`.
   - Flag header action buttons that lack a related icon.
6. When `DetailsPageHeader` uses `slots.attributes`, require `Attribute` from `@rapid7/rds` for each attribute item.
   - Flag ad-hoc attribute rows in header slots (for example `Stack` + `Typography`) when `Attribute` can represent the same content.
7. When status chips, date metadata, or similar title-adjacent indicators are part of header context, require placement in `DetailsPageHeader` slots (`tags` or `attributes`) instead of rendering as separate blocks below the header unless explicitly justified.
8. Flag tab-based layouts that use conditional rendering instead of `TabPanel` components.
9. Flag `variant="fullWidth"` on Tabs unless explicitly required.
10. `DataGridTable` prop compliance:
   - Flag missing `totalCount` when table toolbar/title result count should reflect current displayed rows.
   - In client-side pages, expect `totalCount` to match displayed row set length (for example filtered rows).
   - Flag explicit page-level `checkboxSelectionVisibleOnly` usage without pagination enabled (has no effect in client-side mode).
   - Flag page-level usage of the `title` prop; table titles should not be set directly in page implementations.
11. Dashboard card heading compliance:
   - Flag dashboard chart/table cards that use ad-hoc title `Typography` blocks instead of `CardHeader` (or approved shared wrapper).
12. KPI compliance:
   - Flag KPI-like summary rows implemented as custom cards when `KpiContainer` + `Kpi` should be used.
13. CTA compliance:
   - Flag "Go to ..." buttons without trailing chevron `endIcon`.
14. Severity/status/priority compliance:
   - Flag table cells for severity/status/priority that do not render chip + impact icon.

## Token and Styling Compliance
1. Flag raw visual color literals (`#`, `rgb`, `rgba`, `hsl`) unless explicitly waived.
2. Flag manual visual overrides for review:
   - `sx` color/background/border/shadow/z-index overrides
   - inline `style={{...}}`
   - custom CSS classes for visual primitives
3. Require meaningful non-default styling on core surfaces and controls; default-only pages are a finding.
4. Prefer token-backed overrides over ad-hoc literals or disconnected one-off values.
5. Allow layout literals (spacing/sizing) unless they create one-off visual systems.
6. Flag decorative `Box` shells around `DataGridTable` (border/background/radius wrappers) unless there is an explicit requirement.
7. Flag unnecessary wrapper `Box` usage when spacing/layout can be applied directly to the target component.
8. Flag inconsistent vertical spacing; enforce 16px standard:
   - Between KPI and filter regions.
   - Between FilterBar and DataGridTable.
   - Between major content blocks.
9. Flag FilterBar without 16px margin below it when followed by DataGridTable.
10. Flag FilterBar/DataGridTable spacing if not enforced by either:
   - parent `Stack spacing={2}`
   - or one explicit 16px gap (`mb: '16px'` on FilterBar OR `mt: '16px'` on DataGridTable)
11. For dashboard cards that embed `DataGridTable`, flag nested card chrome (border/shadow) when not flattened to integrate with the parent card.

## Access and Data Compliance
1. Verify hidden fields/actions by persona are not rendered.
2. Verify row activation and detail binding use the same identifier.
3. Flag duplicate result-count labels above tables when `DataGridTable` already exposes built-in result count context.
4. Verify table cell alignment standard is followed:
   - text/categorical values left-aligned and vertically centered
   - numeric values right-aligned and vertically centered

## Dashboard-Specific Audit Checklist (Required When Template Is `dashboard`)
1. Tabs and behavior:
   - Verify tab labels/order match prompt requirements.
   - Verify sticky vs non-sticky behavior of header/tab strip matches prompt requirements.
2. Card headers:
   - Verify chart/table cards use `CardHeader` with consistent spacing.
3. KPI blocks:
   - Verify KPI-like metrics use `KpiContainer` + `Kpi`.
4. Chart configuration correctness:
   - Verify non-cartesian charts do not include inherited cartesian axes.
   - Verify requested source examples (if named in prompt) are reflected in option structure for target charts.
5. Token mapping correctness:
   - Severity charts use `semantic.status`.
   - Category charts use ascending `dataViz.categorical` steps from `10`.
6. Table semantics:
   - Verify severity/status/priority columns use chip + impact icon.
   - Verify dashboard card-contained tables flatten nested `DataGridTable` chrome.
7. CTA pattern:
   - Verify "Go to ..." actions include trailing chevron icons.
8. Compliance-tab completeness (when present in scope):
   - KPI region present.
   - Trend chart present.
   - Composition/distribution chart present.
   - Actionable table/list present.

## Accessibility Compliance
1. Treat accessibility checks as low-severity guidance in PoC mode.
2. Verify one clear page heading when practical.
3. Verify obvious missing control labeling only.
4. Do not fail audits on advanced accessibility conformance unless requested by prompt or requirement.

## Required Audit Output
1. Findings (High)
2. Findings (Medium)
3. Findings (Low)
4. Override review list (keep/remove recommendation)
5. Passed checks summary
6. Final decision: `pass`, `pass-with-review`, or `fail`

## Fail Conditions
1. Persona-restricted fields exposed incorrectly.
2. Disallowed component/import path usage.
3. Token policy violations without waiver.
4. Missing critical routing/binding logic.
5. Non-cartesian chart misconfiguration that can cause runtime errors (for example inherited cartesian axis config on funnel/radar/pie).
6. Dashboard tab sticky behavior contradicts explicit prompt requirement.

## Pass-with-Review Triggers (Prototype Styling)
1. Page is largely default RDS styling with minimal visual differentiation.
2. Overrides exist but are inconsistent, token-light, or visually incoherent.
3. Override strategy is missing for key surfaces (header, filters, data area, KPI/cards).
4. Table framing relies on redundant wrapper `Box` styling instead of component-level styling.
5. Table alignment conventions are inconsistent across columns.
6. Tab-based layout uses conditional rendering instead of TabPanel structure.
7. Vertical spacing is inconsistent or deviates from 16px standard.
8. Tabs lack `mb: '16px'` when serving as primary page section dividers.
9. Header metadata/chips are split between header slots and extra blocks below header without explicit rationale.
10. Dashboard chart/table cards are inconsistent in heading model (mixed ad-hoc `Typography` and `CardHeader`) without explicit rationale.
11. Dashboard table severity/status/priority semantics are inconsistent (some rows chip+icon, others plain text).