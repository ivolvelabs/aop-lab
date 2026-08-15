# AOP Lab

React app for Avnis Oncopathology Lab operations, including bookings, masters, templates, reports, third-party workflows, users, permissions, and printing/report generation.

## Tech Stack

- React 18
- Vite for dev/build
- React Router
- Firebase
- MUI and Tailwind
- PDF/print/report tooling
- Existing `react-scripts` test runner

## Prerequisites

- Node.js `24.12.0` via `.nvmrc` (`^20.19.0 || >=22.12.0` is required by the locked Vite version).
- npm.
- Installed dependencies with `npm install`.
- Required Firebase/environment values in local env files or deployment config. Do not commit secrets.

## Commands

```bash
npm install
npm start
npm run build
npm test -- --watchAll=false
npm run test:ci
npm run preview
```

`npm start` runs the Vite dev server. `npm run build` creates the production build in `dist/`.

## Agent/Developer Docs

- `AGENTS.md`: primary Codex instructions for this repo.
- `CODEX_WORKFLOW.md`: practical workflow playbook.
- `AGENTIC_CODING_BASELINE_2026-04-25.md`: current OpenAI/Codex research baseline used to refresh the agent instructions.
- `PROJECT_AUDIT_2026-02-25.md`: app risk audit and phased optimization plan.

## High-Risk Areas

Review `PROJECT_AUDIT_2026-02-25.md` before changing:
- booking lifecycle screens
- report/template rendering
- auth and role-based routing
- Firestore write flows
- date formatting/filtering/printing logic

## Validation Guidance

- Logic changes: run targeted tests when available.
- UI/runtime changes: run `npm run build`.
- Docs-only changes: verify commands, links, and file references.
