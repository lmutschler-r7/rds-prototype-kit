# Page Templates

Use this file as the single source of truth for page template definitions.

## Templates
1. `builder` - stepwise workflow construction, orchestration, and staged actions.
2. `dashboard` - visualization-led overview pages.
3. `details` - single entity deep-dive pages.
4. `forms` - create/edit/update flows.
5. `listing` - filterable/searchable table-driven pages.
6. `settings` - configuration and preference management pages.

## Current Status
1. `listing` is the implemented reference template.
   - Canonical examples: `Findings`, `Alerts`, `Response & Remediation`.
2. `dashboard` is supported for visualization-led overview pages when prompts explicitly require charts/KPIs.
   - Use token-driven visualization colors and keep chart meaning consistent with the token family.
3. `builder`, `details`, `forms`, and `settings` are supported as starter outlines.

## Template Contracts

### Listing (Implemented Reference Template)
Required core:
1. `DetailsPageHeader` with top-level page actions in header slots.
2. Header action buttons use `size="medium"` and related icons.
3. Optional `KpiContainer` + `Kpi` summary region when page needs at-a-glance counts.
4. `FilterBar` for structured filtering.
5. `DataGridTable` for primary data surface.

Required behavior:
1. Keep FilterBar/table rhythm at exactly 16px (`Stack spacing={2}` preferred).
2. `DataGridTable` in client-side mode includes `totalCount` equal to displayed rows.
3. Text/categorical table cells are left-aligned and vertically centered.
4. Numeric table cells are right-aligned and vertically centered.

Current guidance from implemented listing pages (`Findings`, `Alerts`, `Response & Remediation`):
1. Keep global/top-level actions in `DetailsPageHeader` `slots.actions`; avoid rendering page-level action rows below the header unless explicitly required.
2. Header action buttons should stay `size="medium"` and include a related icon (`AddPlusUnbound` for create/add, `Reporting` for report flows).
3. Use `KpiContainer` + `Kpi` when summary context improves scanability; keep KPI block and next control region separated by a 16px rhythm.
4. Prefer one parent `Stack spacing={2}` to enforce 16px spacing between `FilterBar` and `DataGridTable`.
5. Keep `DataGridTable` in client-side mode with:
   - `isClientSide`
   - `totalCount` bound to the displayed row set length
   - `disableRowSelectionOnClick` when row click is not the primary action
6. Use `FilterBar` model parsing helpers per page domain (for example string/number parsing) and keep filtered datasets deterministic.
7. Keep table cell alignment consistent by data type: text/categorical left, numeric right, both vertically centered.
8. Prefer table `slots` (`tableActions`, `batchActions`) for table-local controls instead of external wrapper toolbars.
9. Do not set the `DataGridTable` `title` prop in page code; use built-in table context and `slots.customCountText` when custom phrasing is required.

### Dashboard (Visualization-Led)
Default stack:
1. Page title block or `DetailsPageHeader` when page-level actions/context are needed.
2. `KpiContainer` + `Kpi` for top summary metrics.
3. Visualization cards (`Card`, `CardContent`, `Typography`) for charts.
4. Optional follow-up tables or detail lists below the primary visual region.

Required behavior:
1. Use `Kpi`/`KpiContainer` for KPI-style metrics instead of custom statistic cards when the content is primarily value + label.
2. For delta or trend summaries in KPIs, prefer `detailSections` with `PERCENTAGE_CHANGE`.
3. Use theme/token-driven chart colors; avoid raw hex values unless no token exists.
4. Select token families by meaning:
   - severity/status/risk: `semantic.status`
   - general chart categories: `dataViz.categorical`
   - heatmaps: `dataViz.heatMap`
   - positive/negative sentiment: `dataViz.sentiment`
   - boolean true/false: `dataViz.boolean`
   - generic progress bars: primary brand color unless the bar belongs to a chart palette
   - when using `dataViz.categorical`, assign colors in ascending order starting at `10`, then `20`, then `30`, and continue upward before reusing any step
5. Do not apply cartesian `xAxis`/`yAxis` defaults to non-cartesian charts such as pie, doughnut, funnel, or radar.
6. Use `CardHeader` for dashboard chart/table card headings.
   - `title` required.
   - `subheader`, `avatar`, and `action` optional.
7. For dashboard cards with tabular data, use `DataGridTable`.
   - If inside a parent `Card`, flatten nested `DataGridTable` card border/shadow and remove inner grid border.
8. Table columns representing severity/status/priority must render chip + impact icon.
9. "Go to ..." dashboard action buttons include a trailing chevron icon.

Current dashboard guidance from implemented prototype work:
1. Use `Tabs` when a dashboard contains multiple operational modes or domains under one page.
2. Keep chart cards visually consistent with token-backed borders, backgrounds, and text colors.
3. “Go to…” navigation actions should use buttons with trailing chevron icons.
4. When a chart is category-driven, keep all series in a coherent `dataViz.categorical` palette rather than mixing unrelated semantic colors.
   - Default category order is ascending: `10 -> 20 -> 30 ...`.
5. When a chart is severity-driven, use the matching `semantic.status` ladder instead of generic warning/error palette picks.
6. Multi-tab dashboard consistency:
   - Define tab order and default tab explicitly.
   - Define sticky behavior for page header and tab strip explicitly.
   - Keep behavior consistent through implementation and audits.
7. Dashboard compliance-style sections should not remain placeholders once requested.
   - When a compliance tab is in scope, include KPI region, trend visualization, distribution/composition visualization, and at least one actionable table/list section.

### Details (Starter Outline)
Default stack:
1. `DetailsPageHeader`
2. Primary detail content blocks (`Card`, `Typography`, `Stack`, `Box`)
3. Optional related `DataGridTable` section for associated records

Current guidance from `VulnerabilityDetail` work:
1. Keep header-context metadata (for example published/modified) in `DetailsPageHeader` `slots.attributes`.
2. Use `Attribute` from `@rapid7/rds` for header attribute items instead of ad-hoc `Stack`/`Typography` rows.
3. Keep title-adjacent status markers (for example CVSS chip/AI indicator) in `DetailsPageHeader` `slots.tags`, not as separate blocks under header.
4. For detail-property rows in content cards, prefer `Attribute` with explicit `labelWidth` and token-backed `AttributeRootProps`/`LabelProps` overrides.
5. For tabbed detail experiences, use `Tabs` + `TabPanel` and keep tab spacing at `mb: '16px'` when tabs are primary section dividers.
6. When a detail tab includes associated-record tables, follow listing rhythm inside that tab: `Stack spacing={2}`, `FilterBar`, then `DataGridTable` with client-side `totalCount` bound to displayed rows.
7. For intelligence or narrative insight sections, `Card` with `variant="ai"` is the preferred optional treatment when AI-context content is present.

### Forms (Starter Outline)
Default stack:
1. `DetailsPageHeader` (or form page title block)
2. Input controls from `@rapid7/rds` grouped by section
3. Clear primary/secondary actions row (`Button` set)

### Settings (Starter Outline)
Default stack:
1. `DetailsPageHeader`
2. Sectioned preference/config groups (`Card`, `Stack`, `Typography`)
3. Save/reset/apply actions per section or page footer

### Builder (Starter Outline)
Default stack:
1. `DetailsPageHeader`
2. Step/phase framing (`Tabs` + `TabPanel` or explicit step sections)
3. Intermediate actions and progress/state summary blocks
