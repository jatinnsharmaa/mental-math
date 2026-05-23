# Mental Math

A fast, focused mental math drill app. Pick your categories, pick a difficulty, and answer multiple-choice questions in an endless loop. Every answer is timed — so you can track not just accuracy but speed over time.

## What it does

- **Five categories:** Multiplication tables, Prime number recognition, Squares & Cubes, Square/Cube roots, Fractions
- **Three difficulty levels:** Easy, Medium, Hard — select any combination
- **Endless mode:** Questions keep coming until you stop. A new batch is prefetched in the background as you work through the current one
- **Instant feedback:** Clicking an answer highlights it immediately (before the server responds), then shows correct/incorrect
- **Analytics dashboard:** Accuracy %, average response time, and breakdowns by category and difficulty — charted over 7, 14, or 30 days

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| State | Zustand (auth persisted, game in-memory) |
| Charts | Recharts |
| Auth | Supabase Auth (email/password) |
| API | Supabase Edge Functions (Deno runtime) |
| Database | Supabase Postgres (Prisma for schema + seeding only) |
| Hosting | Vercel (frontend) + Supabase (functions, DB) |

## Live app

**https://mental-math-jatin.vercel.app**

<img width="727" height="1600" alt="WhatsApp Image 2026-05-23 at 11 31 40" src="https://github.com/user-attachments/assets/7f26a05a-e84f-4ff5-b2a5-8da4c5076b20" />
<img width="1080" height="2376" alt="WhatsApp Image 2026-05-23 at 11 31 02" src="https://github.com/user-attachments/assets/fe46ec55-aacb-439a-baf8-bae282f71f36" />


## How it works

The app has no traditional backend server. All API logic runs in two Supabase Edge Functions:

- **`sessions`** — creates sessions, serves question batches, records answers, ends sessions
- **`analytics`** — aggregates answer history into summary stats and daily breakdowns

The question bank (1,107 questions across all categories and difficulties) lives in Postgres and is seeded once from `seed.ts`. Questions are never exposed with their answers — correctness is evaluated server-side only.

## Project structure

```
/
├── prisma/          # Schema definition (Prisma used locally only, not at runtime)
├── seed.ts          # One-time question seeder
├── supabase/
│   └── functions/
│       ├── _shared/ # Auth, CORS, DB client, distractor generation
│       ├── sessions/
│       └── analytics/
└── frontend/
    └── src/
        ├── pages/   # One component per screen
        ├── stores/  # Zustand: authStore, gameStore
        ├── api/     # Typed fetch wrapper
        └── components/
```

See [SETUP.md](SETUP.md) to run your own instance.
