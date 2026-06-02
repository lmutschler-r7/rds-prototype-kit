# RDS Prototype Kit

Designer-first prototype workspace for building and demoing RDS-powered pages quickly.

## Quick Start

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## Switch Theme and Nav Style

Set these directly in `app/App.tsx`.

1. Open `app/App.tsx`.
2. Find the fallback values in these two expressions:

```ts
const shellVariant: 'current' | 'future' =
	storedShellVariant === 'current' || storedShellVariant === 'future' ? storedShellVariant : 'future';

const themeMode: 'light' | 'dark' =
	storedThemeMode === 'light' || storedThemeMode === 'dark' ? storedThemeMode : 'light';
```

3. Change the fallback values to set your default app style:
	 - Nav shell default: change `'future'` to `'current'` if needed
	 - Theme default: change `'light'` to `'dark'` if needed

Notes:
1. `shellVariant` maps to:
	 - `'future'` -> `FutureNavShell`
	 - `'current'` -> `CurrentNavShell`
2. If a previous localStorage override exists, it will still win over your new defaults. Remove `themeMode` and `shellVariant` from localStorage if your edit does not appear immediately.

## Goal

This repo is optimized for designers to:
1. Add new pages fast.
2. Keep pages visually consistent via RDS tokens.
3. Demo flows in-browser without backend dependencies.

## Build a New Page

1. Create a page file in `app/pages`.
2. Use RDS + RDS-labs components first (avoid custom wrappers when a standard component exists).
3. Use theme tokens via `useTheme<Theme>()` for colors/elevation.
4. Add deterministic mock data in `app/data`.
5. Wire the route in `app/App.tsx`.
6. Validate:

```bash
npm run build
```

## Demo Workflow

Use this when handing off to another designer for review.

1. Create a feature branch.

```bash
git checkout -b designer/<feature-name>
```

2. Build the page and run locally.
3. Push branch and share:
	- Branch name
	- Route(s) to review (example: `/response`, `/findings`)
	- 3-5 test steps (what to click, expected behavior)
4. Optional: publish preview via Vercel/Netlify for non-local reviewers.

## AI Steering

Use `.ai-steering/page-rules-index.md` as the default guidance for new page builds and refactors.
It defines component-first RDS usage, token-based theming, layering rules, and validation checklist items.

Steering files:
1. Build rules: `.ai-steering/page-rules-build.md`
2. Audit rules: `.ai-steering/page-rules-audit.md`

## Page Checklist

Before sharing a demo, confirm:
1. No hardcoded visual color literals in page styling.
2. Uses RDS/RDS-labs primitives where available.
3. Data is deterministic and repeatable.
4. Route is wired and reachable from nav/URL.
5. `npm run build` passes.

## Current Key Routes

1. `/command-home`
2. `/alerts`
3. `/findings`
4. `/response`
