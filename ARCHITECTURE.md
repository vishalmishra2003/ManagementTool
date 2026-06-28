# System Architecture — Apextron Management Tool

This document explains the system design of the Management Tool: how the frontend
and backend are structured, how they communicate, and the key architectural
patterns each layer uses.

---

## 1. High-Level Overview

The application is a **decoupled client–server system**: a single-page React
application (SPA) talking to a stateless REST API over HTTP/JSON. The two apps
are developed and deployed independently.

```
┌─────────────────────────┐         HTTP / JSON         ┌──────────────────────────┐
│   FRONTEND (React SPA)   │ ──── Bearer JWT token ─────▶│  BACKEND (Express REST)  │
│   Vite · localhost:5173  │ ◀─── JSON responses ────────│      localhost:5000      │
└─────────────────────────┘                             └───────────┬──────────────┘
                                                                     │ Mongoose ODM
                                                                     ▼
                                                             ┌───────────────┐
                                                             │  MongoDB Atlas │
                                                             └───────────────┘
```

- **No SSR**, no API gateway, no microservices.
- A **stateless REST monolith** behind a **single-page app**.
- Authentication is **JWT Bearer tokens** — no server-side sessions.

---

## 2. Backend — Layered (N-tier) MVC Architecture

Each request flows top-to-bottom through clearly separated layers:

```
Route → Middleware → Controller → Model (Mongoose) → MongoDB
```

| Layer                | Files                                                      | Responsibility                              |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| **Entry / Compose**  | `server.js`, `src/app.js`                                  | Boot, connect DB, assemble middleware       |
| **Config**           | `src/config/env.js`, `src/config/db.js`                    | Centralized env + DB connection             |
| **Routing**          | `src/routes/index.js`, `src/routes/studentRoutes.js`       | URL → handler mapping, mount auth           |
| **Middleware**       | `src/middleware/auth.js`, `src/middleware/errorHandler.js` | JWT verify, centralized error handling      |
| **Controller**       | `src/controllers/studentController.js`                     | Business logic / request handling           |
| **Model**            | `src/models/AdmissionStudent.js`, `src/models/feesSchema.js` | Data schema + domain rules                 |
| **Utils**            | `src/utils/asyncHandler.js`, `src/utils/ApiError.js`       | Cross-cutting helpers                       |

### Key Patterns

- **Factory pattern for reuse** — `buildStudentRouter(Model, variantField)` and
  `createStudentController(Model, variantField)` generate routers/controllers
  parameterized by a Mongoose model. Admission and English students share **one
  implementation**, differentiated only by a `variantField` (`board` vs `batch`).
- **Stateless JWT auth** — `requireAuth` middleware verifies a Bearer token on
  every protected request; no sessions are stored server-side.
- **Centralized error handling** — `asyncHandler` wraps async controllers so
  thrown errors funnel into a single `errorHandler` middleware; `ApiError`
  standardizes status codes and messages.
- **Embedded document model** — `fees` and `payments` live as embedded
  sub-documents on the student (not separate collections). Fee totals are
  **derived/computed** at serialization time via `feeSummary()`, never stored.

### API Surface

All routes are mounted under `/api`:

| Method                          | Path                                | Auth | Purpose                       |
| ------------------------------- | ----------------------------------- | ---- | ----------------------------- |
| `POST`                          | `/api/auth/...`                     | No   | Login → issue JWT             |
| `GET`                           | `/api/health`                       | No   | Health check                  |
| `GET/POST`                      | `/api/admission`, `/api/english`    | Yes  | List / create students        |
| `GET/PUT/DELETE`                | `/api/{course}/:id`                 | Yes  | Read / update / delete student |
| `PATCH`                         | `/api/{course}/:id/fees`            | Yes  | Set total fee + discount      |
| `POST`                          | `/api/{course}/:id/payments`        | Yes  | Record a payment              |
| `DELETE`                        | `/api/{course}/:id/payments/:pid`   | Yes  | Undo a payment                |
| `*`                             | `/api/fee-structures`               | Yes  | Fee structure CRUD            |

---

## 3. Frontend — Component-Based SPA with Layered Separation

```
main.tsx → AuthContext (provider) → App (router) → Pages → Components
                                          │
                              Hooks ──────┤
                                          │
                              API layer ──┴──▶ apiFetch → backend
```

| Layer                 | Files                                                      | Responsibility                          |
| --------------------- | ---------------------------------------------------------- | --------------------------------------- |
| **Routing / shell**   | `src/App.tsx`                                              | Client-side routes, auth gating         |
| **Global state**      | `src/context/AuthContext.tsx`                             | Auth status via Context API             |
| **Data state**        | `src/hooks/useStudents.ts`                                | Custom hooks for fetching data          |
| **API client**        | `src/api/client.ts`, `src/api/students.ts`, `src/api/auth.ts` | Service layer wrapping `fetch` + tokens |
| **Pages**             | `src/pages/Landing.tsx`, `StudentSection.tsx`, `FeeStructurePage.tsx` | Route-level views             |
| **Components**        | `src/components/StudentFields.tsx`, `FeesPanel.tsx`, etc.  | Reusable UI                             |
| **Config**            | `src/config/courses.ts`                                    | Course-driven configuration             |

### Key Patterns

- **Configuration-driven UI** — `admissionConfig` / `englishConfig` drive the
  same `StudentSection` / `CoursePage` for both course types. This mirrors the
  backend's factory approach: one implementation, parameterized by config.
- **Service layer abstraction** — all HTTP goes through `apiFetch`, which injects
  the JWT and normalizes errors. Components never call `fetch` directly.
- **Custom hooks for data** — `useStudents` manages local state + manual refresh.
  No React Query / Redux; state management is intentionally lightweight.
- **Context API** for the single piece of true global state (auth).

---

## 4. Cross-Cutting Concerns

| Concern              | Implementation                                                            |
| -------------------- | ------------------------------------------------------------------------ |
| **Auth**             | JWT Bearer token; stored in `localStorage`, injected by `apiFetch`       |
| **CORS**             | Restricted to `env.clientOrigin` in `app.js`                             |
| **Error handling**   | Backend: `ApiError` + `errorHandler`. Frontend: `ApiError` class in client |
| **Config / secrets** | `.env.developement` loaded via `dotenv` in `config/env.js`               |
| **Theming**          | Dark mode toggled on `documentElement`, persisted in `localStorage`      |

---

## 5. The Defining Design Choice

The standout architectural decision on **both** sides is
**factory / config-parameterized reuse**:

- **Backend:** one router + controller factory serves both Admission and English
  students, differentiated only by a `variantField`.
- **Frontend:** one set of pages/components is driven by a per-course config
  object.

This keeps the two student "courses" (Admission and English) running through a
single shared codebase rather than duplicated implementations.

---

## 6. One-Line Summary

> A stateless JWT-secured REST monolith (layered MVC — Express + Mongoose +
> MongoDB) serving a config-driven React SPA (component + service-layer
> architecture, Context for global state).
