# AOP Lab App Deep Audit (2026-02-25)

## Scope Covered

- App bootstrap, auth, routing, layout shell
- Bookings end-to-end workflow
- Masters, Templates, ThirdParty, Users & Permissions
- Printing/report generation components
- UI/UX consistency, performance, code quality, and maintainability

## Executive Summary

- The app is functionally rich and business-aware, but currently carries high technical debt in critical paths.
- Core risks are concentrated in booking/report modules (large monolith components, data-shape inconsistency, and unsafe HTML rendering).
- There are multiple duplicate/legacy files, incomplete feature surfaces, and reliability gaps that will slow future implementation.
- A phased optimization/refactor plan is required to reach a stable "best for client + fast to build" state.

## Findings (By Severity)

## Critical

1. HTML rendering safety on report/template views.
- Impact: XSS/vector risk and client-facing data integrity risk if unsanitized paths exist.
- Status: active render paths are now sanitized with `src/utils/sanitizeHtml.js`.
- Residual risk: legacy/duplicate files still need cleanup/removal to fully eliminate dormant unsafe render points.

2. Booking create flow previously inserted item names on each booking save (data duplication risk in master taxonomy).
- Impact: master data pollution and degraded search/filter quality.
- Previous reference: `src/Bookings/CurrentBookings.jsx:345`
- Status: fixed in this pass by conditional create logic.

3. Authentication state lacked explicit loading gate (redirect flicker/race risk).
- Impact: unstable protected-route UX and occasional false redirects.
- Previous references:
  - `src/Contexts/AuthContext.jsx:31`
  - `src/Auth/RequireAuth.jsx:13`
- Status: fixed in this pass with `isAuthLoading`.

## High

1. Large monolithic components in critical workflow.
- Impact: fragile changes, bug-prone edits, slow onboarding.
- References:
  - `src/Bookings/CurrentBookings.jsx` (821 lines)
  - `src/Bookings/ThirdPartyReportsTest.jsx` (676 lines)
  - `src/Bookings/SlideDelivered.jsx` (383 lines)
  - `src/Bookings/ResultEntered.jsx` (374 lines)

2. Duplicate/legacy component variants coexisting with active paths.
- Impact: confusion, regression risk, accidental edits to dead copies.
- References:
  - `src/Bookings/ResultAuthorised copy.jsx`
  - `src/UsersAndPermissions/UsersAndPermissions1.jsx`
  - `src/UsersAndPermissions/UserTable1.jsx`
  - `src/Bookings/ThirdPartyReportsTest.jsx` vs `src/Bookings/ThirdPartyReports.jsx`

3. Incomplete feature implementations shipped in UI (edit/delete flows).
- Impact: poor UX and trust issues for operators.
- Reference:
  - `src/ThirdParty/ThirdpartyTable.jsx:47`
  - `src/ThirdParty/ThirdpartyTable.jsx:52`

4. Mixed date shapes (Timestamp/string/Date) across modules.
- Impact: formatting bugs, brittle reporting/printing logic.
- References:
  - `src/Bookings/ThirdPartyReportsTest.jsx:305`
  - `src/Bookings/CurrentBookings.jsx:398`
  - `src/Bookings/MyBookings.jsx:102`

## Medium

1. Repeated client-side filtering over full onSnapshot/getDocs results.
- Impact: avoidable rendering and query cost as data grows.
- References:
  - `src/Masters/Categories/Categories.jsx:48`
  - `src/ThirdParty/ThirdPartyHospitals.jsx:100`
  - `src/Templates/Diagnosis.jsx:59`

2. Memory-leak pattern: snapshot subscriptions created inside save handlers.
- Impact: dangling listeners and hard-to-track state updates.
- References:
  - `src/Masters/Categories/Categories.jsx:103`
  - `src/Masters/SubCategories/SubCategories.jsx:132`

3. Overuse of inline styles and mixed styling systems.
- Impact: inconsistent design language and harder theming.
- References:
  - `src/Layout/MainLayout.jsx`
  - `src/Bookings/MyBookings.jsx`
  - multiple Templates/Masters modules

4. Unused imports/dead code and debug logging across production paths.
- Impact: noise, slower reviews, higher bug probability.

## Low

1. Naming inconsistencies and component naming drift.
- Example: `const Masters = () =>` in `src/ThirdParty/ThirdParty.jsx`.
2. Minor UI text inconsistencies and button label duplication.

## UI/UX Audit

## Current Strengths

- Clear domain segmentation (Bookings, Masters, Templates, Users, ThirdParty).
- MUI usage gives a reasonable baseline for form/table ergonomics.
- Report generation and workflow-stepper are aligned with lab operations.

## UX Gaps

- Desktop-biased shell; no robust responsive navigation strategy.
- No consistent loading skeleton/error boundaries in most data views.
- Inconsistent form validation depth (basic required only in many dialogs).
- Very dense screens for critical workflows; weak visual hierarchy for errors/warnings.
- Print/report screens are logic-heavy and visually fragile (inline styles and repeated structures).

## Code Quality and Architecture Audit

- Too many "feature pages" directly own Firestore, transformations, form state, and rendering.
- No shared service layer for Firestore access patterns.
- No reusable "CRUD template panel" abstraction despite high duplication in template modules.
- No central utility layer for date formatting, role guards, and document-shape normalization.

## Changes Applied In This Pass

1. Removed duplicate Firebase bootstrap from `src/index.js` and centralized config in `src/firebase.js`.
2. Added env-fallback Firebase config pattern in `src/firebase.js`.
3. Added `isAuthLoading` flow in `src/Contexts/AuthContext.jsx` and loader/redirect-state in `src/Auth/RequireAuth.jsx`.
4. Cleaned `src/App.jsx` imports and route mapping key correctness.
5. Refactored `src/Layout/MainLayout.jsx`:
- route-aware titles
- fixed selected nav logic
- aligned templates role permissions
- cleaner logout flow
6. Fixed zero-count rendering bug in `src/Components/CardComponent.jsx`.
7. Cleaned dead code/imports in `src/Home/HomePage.jsx`.
8. Cleaned and stabilized `src/Bookings/BookingsTable.jsx` (keys, null-safe access, dead imports).
9. Fixed optimistic duplication in user/third-party create flows:
- `src/UsersAndPermissions/UsersAndPermissions.jsx`
- `src/ThirdParty/ThirdPartyHospitals.jsx`
10. Improved booking-create integrity in `src/Bookings/CurrentBookings.jsx`:
- initial form state normalization
- conditional item-name creation
- selected date persistence
- no-op metadata update removal
11. Fixed JSX `class` attribute issues and minor result-authorize correctness in `src/Bookings/ResultAuthorised.jsx`.
12. Cleaned legacy unused imports in `src/Bookings/MyBookings.jsx`.
13. Removed widespread ESLint warnings across Bookings/Masters/Templates/ThirdParty modules.
14. Reworked `src/Bookings/ThirdPartyReportsTest.jsx` bootstrap effect to be hook-deps safe (no disable comments).
15. Added responsive dashboard KPI cards and error handling in `src/Home/HomePage.jsx`.
16. Upgraded `src/Components/CardComponent.jsx` UX (clear hierarchy, icon/accent support, direct router button integration).
17. Centralized role-based navigation metadata in `src/config/navigation.js` and reused it in routes + layout.
18. Added route-level lazy loading with suspense fallback in `src/App.jsx`, reducing initial main bundle significantly.
19. Added CRA compatibility dependency (`@babel/plugin-proposal-private-property-in-object`) and updated browserslist DB.
20. Cleaned debug logs from active workflow paths (`CurrentBookings`, `ResultAuthorised`, `MyBookings`, templates).
21. Added shared HTML sanitizer utility (`dompurify`) and applied it to all active `dangerouslySetInnerHTML` surfaces in bookings/template modules.

## Validation Status

- `npm run build` now succeeds with clean compilation (no ESLint warnings).
- CRA toolchain warnings from missing Babel plugin and outdated browserslist DB have been removed in build output.
- `npm start` validation is environment-limited because active dev servers are already bound to common ports while parallel runs are in progress.

## Recommended Phased Optimization Plan

## Phase 1 (Immediate, 1-2 days)

- Remove or archive duplicate legacy files after confirming they are unused (current residual risk holder).
- Introduce shared utility for date normalization (`Timestamp|string|Date` -> consistent display).
- Switch to single canonical module per feature where duplicates still exist.

## Phase 2 (Core Refactor, 3-5 days)

- Extract Firestore operations into domain services (`bookingsService`, `templatesService`, etc.).
- Split large workflow components (`CurrentBookings`, `ResultEntered`, `SlideDelivered`) into subcomponents + hooks.
- Introduce reusable form/input blocks for repetitive dialog patterns.

## Phase 3 (UX Upgrade, 3-4 days)

- Responsive app shell and navigation behavior.
- Consistent page headers, empty states, loading skeletons, and actionable errors.
- Report viewer redesign (preview, status badges, print/download actions with clearer state).

## Phase 4 (Quality Automation, 1-2 days)

- Lint/type checks in CI (`npm run lint` or equivalent).
- Targeted tests for booking flow and role-based routing.
- Add guardrails for new code (module boundaries + conventions).
