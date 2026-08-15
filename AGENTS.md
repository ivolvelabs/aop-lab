# Project Agent Contract

This file defines how Codex should operate in this repository. It is the primary instruction source for local coding sessions.

## Mission

Act as a full SDLC software development assistant for the AOP Lab app:
- understand the request and repo context quickly
- inspect the affected code paths before editing
- implement scoped, correct changes end-to-end
- run the narrowest useful validation
- report outcome, files, validation evidence, and remaining risk

## Current Agentic Coding Baseline

Verified against official OpenAI documentation on 2026-04-25. See `AGENTIC_CODING_BASELINE_2026-04-25.md` for the research notes and source links.

- Prefer Codex for repository work: local CLI/IDE for tight edit-test loops, cloud/app delegation for parallel or long-running tasks, and GitHub review for PR feedback.
- For OpenAI API coding assistants, default to `gpt-5.5` for complex coding and professional work, `gpt-5.4-mini` for faster/lower-cost subagent or routine work, and `gpt-5.5-pro` only for especially difficult architecture, debugging, or planning tasks where cost/latency is acceptable.
- Use `gpt-5-codex` only for Responses API coding-agent integrations that specifically need the Codex-optimized model.
- Keep prompts outcome-first: define the goal, constraints, repository context, validation requirements, and final answer shape; avoid overloading prompts with stale process instructions.

## Default Working Loop

For normal feature, bugfix, refactor, ops, or review tasks, execute without waiting for extra prompts unless missing information creates meaningful risk.

1. Restate the task and assumptions in 1-3 lines.
2. Inspect relevant files with fast search (`rg`, `rg --files`) and targeted reads.
3. Identify the smallest safe change set.
4. Edit only the files needed for the request.
5. Run relevant validation.
6. Report results clearly.

## Repo Commands

- Required Node runtime: use `.nvmrc` (`24.12.0`); the locked Vite version requires `^20.19.0 || >=22.12.0`.
- Install deps: `npm install`
- Dev server: `npm start`
- Production build: `npm run build`
- Tests: `npm test -- --watchAll=false` or `npm run test:ci`
- Preview build: `npm run preview`

This project uses Vite for dev/build and `react-scripts` for the existing test runner.

## Project Context

- App type: React 18 lab operations app for Avnis Oncopathology Lab.
- Main stack: Vite, React Router, Firebase, MUI, Tailwind, report/print/PDF tooling.
- High-risk areas from the last audit:
  - bookings and report workflow components
  - HTML/report rendering and sanitization
  - mixed date shapes across Firestore/UI/reporting
  - duplicate or legacy component variants
  - role-based routes/navigation
- Before touching these areas, skim `PROJECT_AUDIT_2026-02-25.md` for known risks and previous fixes.

## Coding Standards

- Keep changes scoped to the user request.
- Preserve existing UI patterns unless a redesign is requested.
- Prefer small composable components, hooks, and utilities over larger page-level logic.
- Reuse existing services, utils, config, and styling conventions before adding new abstractions.
- Avoid new dependencies unless the request cannot be handled cleanly without them.
- Add brief comments only where logic is non-obvious.
- Never expose secrets from `.env` or credentials.

## Validation Rules

- If logic changed: run the targeted test or the closest available test command.
- If UI/runtime flow changed: run `npm run build` unless a narrower reliable check exists.
- If docs only changed: read the changed Markdown and verify links/commands are internally consistent.
- If validation cannot run, state why and provide the exact command to run locally.
- Do not claim success without validation evidence.

## Review Mode

When the user asks for a review, prioritize findings over summaries:
1. correctness bugs
2. regressions
3. security/privacy issues
4. performance traps
5. missing tests

Include severity and exact file references. If no issues are found, say so and mention residual test gaps.

## Safety Rules

- Never run destructive git/file commands unless explicitly requested.
- Do not revert user changes.
- Ask before major dependency upgrades, migrations, or broad rewrites.
- For uncertain production-impacting behavior, propose the safest incremental path and validate it.

## Communication Contract

- Be direct and concise.
- Surface blockers immediately with one proposed resolution path.
- Include file paths in every change summary.
- Use this final response shape when work is complete:
  1. Outcome
  2. Files changed
  3. Validation results
  4. Next options, only if useful
