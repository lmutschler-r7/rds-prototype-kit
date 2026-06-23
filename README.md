# RDS Prototype Kit

Designer-first prototype workspace for building and demoing RDS-powered pages quickly.

## Dev Setup

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## Create a New Page

1. Create a page file in `app/pages/MyPage.tsx`
2. Use `@rapid7/rds` components and theme tokens (`useTheme()`)
3. Add mock data to `app/data/`
4. Wire the route in `app/App.tsx`
5. Validate with `npm run build`

For detailed guidance, see [.ai-steering/page-rules-index.md](.ai-steering/page-rules-index.md).

## Rules & Guidelines

All work follows [.ai-steering/page-rules-index.md](.ai-steering/page-rules-index.md), which covers:
- **Component usage**: Prefer @rapid7/rds over custom wrappers
- **Styling**: Use theme tokens for colors, spacing, shadows
- **Build rules**: Specific patterns for dashboards, tables, and charts
- **Audit checks**: Validation steps before submitting

Both **Copilot** and **Kiro** automatically load these rules when working in this repo—no setup needed.

## Switch Theme & Nav Style

No code changes needed—both are toggled in the running prototype:

**Theme (light / dark)**
Click the **Rapid7 logo** in the top-left corner of the nav. It switches between light and dark mode with an animated transition.

**Nav style (current / future)**
Click your **user avatar** (the initials badge) in the nav. A menu appears with a **Switch Nav** option. Selecting it swaps the nav shell with an animated reveal.

Both preferences are stored in `localStorage` so they persist between page reloads.

## Current Routes

- `/command-home`
- `/alerts`
- `/findings`
- `/response`
