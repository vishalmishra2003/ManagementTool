# Apextron Management Tool — Backend

Express + Mongoose + MongoDB API with JWT auth. Single hard-coded admin (no signup);
credentials live in `.env.developement`. Data is stored in MongoDB — CSV is for
**download only**, never storage.

## Setup

1. `npm install`
2. Edit `.env.developement`:
   - Set `MONGO_CLUSTER` to your Atlas host (e.g. `cluster0.ab1cd.mongodb.net`)
     — or set a full `MONGO_URI`.
   - Change `JWT_SECRET` to a long random string.
   - Set `ADMIN_USERNAME` / `ADMIN_PASSWORD` (must match the frontend `.env`).
3. `npm run dev` (nodemon) or `npm start`.

Server runs on `http://localhost:5000`.

## API

All routes are under `/api`. Everything except `/auth/login` and `/health`
requires `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/health` | Health check |
| POST | `/auth/login` | Login with env credentials → `{ token }` |
| GET  | `/auth/me` | Validate token |
| GET  | `/admission` · `/english` | List students (`?standard=` `?board=`/`?batch=` filters) |
| POST | `/admission` · `/english` | Create student |
| GET  | `/admission/:id` · `/english/:id` | Single student incl. payment history |
| PUT  | `/admission/:id` · `/english/:id` | Update demographic fields |
| DELETE | `/admission/:id` · `/english/:id` | Delete student |
| PATCH | `/admission/:id/fees` | Set total fee + discount |
| POST | `/admission/:id/payments` | Record a payment |
| DELETE | `/admission/:id/payments/:paymentId` | Undo a payment |
| GET/POST | `/fee-structures` | List / upsert standard-wise default fee |
| PUT/DELETE | `/fee-structures/:id` | Update / delete |

Each student response includes a computed `feeSummary`:
`{ totalFee, discount, netFee, paid, balance, status }` where
`netFee = totalFee − discount`, `paid = Σ payments`, `balance = netFee − paid`,
and `status` is `paid` / `partial` / `unpaid`.

## Structure

```
server.js                entry — connect DB then listen
src/
  app.js                 express app (cors, json, routes, error handling)
  config/{env,db}.js     env loading + Mongo connection
  models/                AdmissionStudent, EnglishStudent, FeeStructure, feesSchema
  middleware/            auth (JWT), errorHandler
  controllers/           auth, student (factory), feeStructure
  routes/                auth, student (factory), feeStructure, index
  utils/                 asyncHandler, ApiError
```
