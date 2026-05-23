# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Mental math drill game. Players pick categories and difficulty, then answer multiple-choice questions in an endless loop. Response times are tracked and visualised in an analytics dashboard.

**Deployed at:** https://mental-math-jatin.vercel.app  
**Supabase project:** `ygaazafwwfrlaiuybnxn` (Tokyo region)

## Repo layout

```
/                        # Root — Prisma schema, seed script, root tests
  prisma/schema.prisma   # DB schema (Question, Session, SessionAnswer)
  seed.ts                # Seeds 962 questions; export buildQuestions() for tests
  seed.test.ts           # Root-level Vitest tests for seeder
  vitest.config.ts       # Root Vitest config (node env, *.test.ts)

supabase/functions/      # Deno Edge Functions (always warm, no cold starts)
  _shared/               # Shared helpers imported by both functions
    auth.ts              # verifyToken() — supabase.auth.getUser(token)
    cors.ts              # handleCors() + corsHeaders
    db.ts                # getServiceClient() — Supabase JS client
    distractors.ts       # generateOptions() + formatQuestion()
  sessions/
    index.ts             # POST /sessions, GET /sessions/:id/next, POST /sessions/:id/answers, POST /sessions/:id/end
    routes.ts            # matchRoute() — pure function, extracted for unit testing
  analytics/
    index.ts             # GET /analytics/summary, GET /analytics/daily?days=N
    aggregate.ts         # aggregateAnswers() + groupByDay() — pure functions

frontend/src/
  App.tsx                # Screen router (login|signup|home|game|results|dashboard) — no React Router
  api/client.ts          # All fetch calls; reads token from authStore; base URL from VITE_API_URL
  stores/
    authStore.ts         # Zustand + persist middleware → localStorage key 'auth'
    gameStore.ts         # Zustand in-memory; holds questions[], currentIndex, answers[]
  pages/                 # One file per screen
  components/            # SessionConfig, QuestionCard, Timer, charts/
  types.ts               # Shared TypeScript types
  test-setup.ts          # jsdom localStorage mock + @testing-library/jest-dom
```

## Commands

### Root (seed + schema)
```bash
npx prisma db push          # Apply schema to Supabase Postgres
npx tsx seed.ts             # Seed 962 questions (clears SessionAnswer, Session, Question first)
npx vitest run              # Run root-level tests (seed.test.ts)
npx vitest run seed.test.ts # Run a single root test file
```

### Edge Functions (Deno)
```bash
npx supabase functions serve --env-file .env          # Local dev (port 54321)
deno test supabase/functions/ --allow-env              # Run all Deno tests
deno test supabase/functions/_shared/distractors.test.ts  # Single test
npx supabase functions deploy sessions                 # Deploy sessions function
npx supabase functions deploy analytics                # Deploy analytics function
```

> If `deno` is not in PATH, use the full path: `~/.deno/bin/deno`

### Frontend
```bash
cd frontend
npm run dev           # Vite dev server (uses .env.local → localhost:54321 functions)
npm run build         # tsc + vite build
npm run lint          # ESLint
npx vitest run        # Run all frontend tests
npx vitest run src/pages/GamePage.test.tsx  # Run a single test file
npx vercel --prod     # Deploy to Vercel production
npx vercel alias <deployment-url> mental-math-jatin   # Re-point clean alias after deploy
```

## Architecture decisions

### No backend server — Edge Functions only
All API logic lives in two Supabase Edge Functions (`sessions`, `analytics`). There is no Express/Node server. The Deno runtime is always warm.

### Screen router in App.tsx
Navigation is a `useState<Screen>` enum — no React Router. Each page component receives callbacks (`onEnd`, `onHome`, etc.) to advance the screen. `sessionId` is the only piece of cross-screen state that lives in `App.tsx`.

### Two Zustand stores
- `authStore` — persisted to `localStorage`. Holds JWT token + user object. Token is read directly (not via hook) inside `api/client.ts` using `useAuthStore.getState()`.
- `gameStore` — in-memory only. Holds the current question batch, index, and answers for the active session. Reset on new session.

### Endless mode with prefetch
`GamePage` fetches a batch of 30 questions on session start. When fewer than 8 remain, it prefetches the next batch via `GET /sessions/:id/next`. A `useRef` flag prevents double-fetching.

### Answer correctness
Checked server-side in the Edge Function: `userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()`. The correct answer is never sent to the client before submission.

### Session ownership enforcement
Every session route (`next`, `answers`, `end`) fetches the session with both `.eq('id', sessionId)` **and** `.eq('userId', user.userId)` before acting on it. Returns 404 on mismatch (not 403, to avoid confirming the session exists). Do not add new session routes without this check.

### Options generation
`_shared/distractors.ts` generates 3 wrong answers then shuffles all four. Strategy varies by category:
- **`primes`** — always returns `['yes', 'no']` in that fixed order (never shuffled).
- **`squares_cubes` and `multiplication`** — distractors are `correct ± k×10` (k=1,2,3…) so every option shares the same last digit as the correct answer. Prevents process-of-elimination via the last-digit shortcut.
- **`roots` and `fractions`** — category-specific decimal delta arrays (e.g. `[0.05, 0.1, ...]`).

### Prisma is local-only
Prisma is used only for schema management (`prisma db push`) and seeding (`seed.ts`). The Edge Functions use the Supabase JS client directly at runtime — Prisma is never imported in Edge Function code.

### Table permissions
Prisma-created tables default to no Supabase role access. After any `prisma db push`, run:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated, service_role, anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role, anon;
```

## Environment files

| File | Purpose |
|------|---------|
| `.env` | Root — `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` for Prisma + seeder |
| `frontend/.env.local` | Dev — `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_URL=http://localhost:54321/functions/v1` |
| `frontend/.env.production` | Prod — same vars with `VITE_API_URL=https://ygaazafwwfrlaiuybnxn.supabase.co/functions/v1` |

`VITE_SUPABASE_PUBLISHABLE_KEY` is the correct env var name (not `ANON_KEY`).

> **Important:** `frontend/.env.production` is gitignored and never committed. Production env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_URL`) must be set directly in the Vercel project settings (Dashboard → Project → Settings → Environment Variables). Without them the deployed build will have `BASE = undefined` and all API calls will fail.

## Testing notes

- **Root tests** use Vitest with node environment. Config: `vitest.config.ts` at root (includes `*.test.ts`).
- **Frontend tests** use Vitest with jsdom. Config: `frontend/vite.config.ts` (must import from `vitest/config`, not `vite`, to support the `test` field).
- **Deno tests** use `Deno.test` + `jsr:@std/assert`. Run with the full Deno path above.
- `frontend/src/test-setup.ts` provides a full `localStorage` mock — required because Zustand's `persist` middleware breaks in jsdom without it.
- When mocking `api` in frontend tests, use `vi.mock('../api/client', () => ({ api: { methodName: vi.fn() } }))` to avoid hoisting issues with `vi.fn()` references.
