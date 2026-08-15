# AOP Lab Phase 1 Production Readiness Design

## Goal

Restore the original third-party account workflow and make Firebase deployment coherent before broader UI/workflow refactors.

## Confirmed Current Behavior

- Roles are `admin`, `technician`, `receptionist`, and `thirdparty`.
- The booking workflow remains `Received -> Grossed -> Slide Delivered -> Result Entered -> Result Authorized`.
- Third-party users can create bookings from the existing third-party booking surface.
- Completed bookings move from Current to Past because authorization sets `isCompleted: true`.
- Hospitals/clinics are intended to be login-enabled third-party accounts via `createThirdParty`.
- Doctors are currently simple Firestore records, but the intended product behavior is login-enabled doctor accounts too.
- The functions source currently lives under `aop-lab-functions/functions`, separate from the main root deployment config.

## Decisions

- Merge Firebase Functions into the root project so one deploy command can deploy hosting and functions.
- Keep doctors and hospitals/clinics as login-enabled third-party accounts.
- Keep login mandatory for both doctors and hospitals/clinics.
- Preserve the existing `thirdparty` role, with `type` distinguishing `doctor` and `hospital`.
- Use archive/deactivate rather than hard delete for doctors/hospitals in later CRUD phases.
- Improve function error handling now so the UI can show clear failure reasons.

## Phase 1 Scope

- Add root `functions/` with the callable functions.
- Update root `firebase.json` to include hosting and functions config.
- Harden callable functions:
  - validate required fields
  - return Firebase Auth errors clearly
  - write `createdAt`, `updatedAt`, and `active`
  - keep Firestore document id equal to Auth UID
- Update doctor creation to call `createThirdParty`, matching hospital creation.
- Improve doctor/hospital creation UI feedback for success and error states.

## Out Of Scope For Phase 1

- Report print template restoration.
- Booking workflow UX redesign.
- Full CRUD/archive UI across all modules.
- Firestore security rules review.
- Duplicate file cleanup.

## Validation

- `npm run build` from root must pass.
- `npm --prefix functions install` must work if root `functions/node_modules` is missing.
- `npm --prefix functions run lint` should be attempted after functions are installed.
- Browser smoke test should confirm the app still loads.
