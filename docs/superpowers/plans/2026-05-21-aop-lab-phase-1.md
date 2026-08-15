# AOP Lab Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore login-enabled doctor/hospital creation and make Firebase hosting + functions deploy from one root project.

**Architecture:** Root Firebase config will own both hosting and functions. Callable functions create Firebase Auth users and matching Firestore profile documents. The React third-party screens will use the callable function for both doctors and hospitals.

**Tech Stack:** React 18, Vite, Firebase Auth, Firestore, Firebase Functions v2, Firebase Admin SDK, MUI.

---

### Task 1: Root Functions Setup

**Files:**
- Create: `functions/index.js`
- Create: `functions/package.json`
- Create: `functions/package-lock.json`
- Modify: `firebase.json`

- [ ] Copy the existing functions package into root `functions/`.
- [ ] Update root `firebase.json` to include a `functions` block with source `functions`.
- [ ] Keep existing hosting rewrite behavior unchanged.

### Task 2: Callable Function Hardening

**Files:**
- Modify: `functions/index.js`

- [ ] Replace generic catch behavior with `HttpsError` handling that preserves `invalid-argument`, `already-exists`, and `internal` categories.
- [ ] Normalize email, name, type, role, phone, address, and team members.
- [ ] Store third-party records with `active: true`, `createdAt`, `updatedAt`, and `authUid`.
- [ ] Return `{ uid, message }` on success.

### Task 3: Doctor Creation Uses Auth-Backed Third Party

**Files:**
- Modify: `src/ThirdParty/Doctors.jsx`

- [ ] Replace direct `addDoc(collection(db, "thirdparty"))` with `httpsCallable(functions, "createThirdParty")`.
- [ ] Add password field because doctor login is mandatory.
- [ ] Keep existing doctor fields: name, email, phone.
- [ ] Send `role: "thirdparty"` and `type: "doctor"`.
- [ ] Show clear success/error alerts.

### Task 4: Hospital Creation Feedback

**Files:**
- Modify: `src/ThirdParty/ThirdPartyHospitals.jsx`

- [ ] Keep `createThirdParty` path.
- [ ] Add visible success/error alerts.
- [ ] Require name, email, and password before save.
- [ ] Keep `role: "thirdparty"` and `type: "hospital"`.

### Task 5: Validation

**Commands:**
- `npm run build`
- `npm --prefix functions install`
- `npm --prefix functions run lint`

- [ ] Run root production build.
- [ ] Install functions dependencies if root `functions/node_modules` is missing.
- [ ] Run functions lint and report any remaining lint-only issues separately from app correctness.
