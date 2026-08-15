# Codex Workflow Playbook

This playbook turns the repo contract in `AGENTS.md` into repeatable workflows for building, debugging, reviewing, and maintaining this app.

## 1. Intake

Classify the request:
- `feature`: new behavior, UI, workflow, or integration
- `bugfix`: behavior mismatch, runtime error, failed build, failed test
- `refactor`: quality/structure without intended behavior change
- `ops`: install, run, build, deploy, environment, CI
- `review`: risk-focused code or PR review
- `docs`: documentation, instructions, onboarding, audit notes

Then identify:
- expected output
- user-visible behavior
- affected domain area
- validation command
- risk level

Ask only when the missing answer would materially change the implementation or create real risk.

## 2. Discovery

Use fast, narrow discovery first:
- list files with `rg --files`
- search symbols and text with `rg`
- read only the files needed for the task
- check `package.json` before assuming commands
- check `PROJECT_AUDIT_2026-02-25.md` before changing audited risk areas

For this app, inspect these common entry points:
- routes and app shell: `src/App.jsx`, `src/Layout/MainLayout.jsx`, `src/config/navigation.js`
- auth: `src/Contexts/AuthContext.jsx`, `src/Auth/RequireAuth.jsx`
- bookings: `src/Bookings/`
- templates/reports: `src/Templates/`, `src/Bookings/*Report*`, `src/utils/sanitizeHtml.js`
- Firebase: `src/firebase.js`

## 3. Planning

Choose the smallest safe change set. For simple fixes, plan mentally and proceed. For larger work, state a compact plan before editing:
1. inspect affected flow
2. patch focused files
3. run validation
4. report residual risk

Avoid broad refactors unless they directly reduce risk for the request.

## 4. Editing

- Follow existing React, MUI, routing, Firebase, and form patterns.
- Keep page components from accumulating more unrelated responsibilities.
- Prefer extracting shared date, Firestore, sanitization, permission, or formatting logic when duplication is already causing bugs.
- Keep loading, empty, error, and permission states explicit.
- Do not edit duplicate/legacy variants unless confirming the active route/import uses them.

## 5. Validation

Use the narrowest reliable check:
1. docs-only: read changed Markdown and verify commands/links are coherent
2. targeted logic: run relevant test if one exists
3. UI/runtime change: run `npm run build`
4. run app request: run `npm start` and report the local URL
5. full confidence pass: run `npm run build` plus relevant tests

If a command fails, capture the useful failure lines, fix if in scope, and rerun.

## 6. Reporting

Use a compact handoff:
1. `Outcome`
2. `Files changed`
3. `Validation results`
4. `Next options` only when useful

Do not bury failures or skipped validation.

## 7. Agentic SDLC Patterns

Use Codex/ChatGPT across the SDLC like this:
- Requirements: turn the request into acceptance criteria, constraints, and edge cases.
- Design: inspect current architecture first, then propose the smallest compatible design.
- Implementation: edit locally with frequent narrow validation.
- Debugging: reproduce, isolate, patch, rerun.
- Review: use `/review` or a review prompt focused on correctness, security, and edge cases.
- Documentation: update README/playbooks/audit notes when behavior or workflow changes.
- Release support: run build/tests, summarize risk, and prepare deployment notes.

## 8. Model and Tool Defaults

Use the current OpenAI model baseline in `AGENTIC_CODING_BASELINE_2026-04-25.md`:
- `gpt-5.5`: default for complex reasoning, app architecture, difficult implementation, and code review.
- `gpt-5.4-mini`: faster/cost-efficient routine coding, summarization, and subagent work.
- `gpt-5.5-pro`: rare escalation for hardest debugging/planning where slow responses are acceptable.
- `gpt-5-codex`: Codex-optimized model for Responses API coding-agent integrations.

For prompts, keep instructions outcome-first:
- goal
- repo/module context
- constraints
- acceptance criteria
- validation command
- desired final format

## 9. App-Specific Guardrails

- Treat bookings/reporting as critical path code.
- Preserve report sanitization; never add unsanitized `dangerouslySetInnerHTML`.
- Normalize dates at boundaries before display, filtering, sorting, or printing.
- Preserve role/permission behavior when editing navigation or routes.
- Keep Firebase writes intentional and avoid duplicate master data creation.
- Do not leave temporary diagnostics, logs, or test scaffolding in production paths.

## 10. UI Workflow

For UI work:
- run or build the app before final handoff when feasible
- keep screens dense but readable for lab operators
- favor clear tables, forms, status chips, loading states, and actionable errors
- avoid marketing-style layouts inside operational workflows
- test responsive behavior when changing shell/navigation/layout

## 11. Review Protocol

For a local review:
1. inspect changed files or requested area
2. list findings first by severity
3. include exact file references
4. mention missing tests or remaining risk

For GitHub PR review, use Codex/GitHub review workflows when available, then rerun review after fixes.
