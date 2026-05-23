# Mental Math

A fast, focused mental math drill app. Pick your categories, pick a difficulty, and answer multiple-choice questions in an endless loop. Every answer is timed — so you can track not just accuracy but speed over time.

## What it does

- **Five categories:** Multiplication tables, Prime number recognition, Squares & Cubes, Square/Cube roots, Fractions
- **Three difficulty levels:** Easy, Medium, Hard — select any combination
- **Endless mode:** Questions keep coming until you stop. 80 questions are fetched upfront; the next batch is prefetched seamlessly in the background
- **Instant feedback:** Clicking an answer highlights it immediately and shows correct/incorrect — no round-trip to the server
- **Analytics dashboard:** Accuracy %, average response time, and breakdowns by category and difficulty — charted over 7, 14, or 30 days
- **Mistakes review:** See which specific questions you got wrong, how many times, filtered by category/difficulty and over 7 or 30-day windows

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

<img width="534" height="300" alt="Manifestation, Principles, Goals" src="https://github.com/user-attachments/assets/b0772e87-87dd-419b-b26d-c60b793df62e" />


## How it works

The app has no traditional backend server. All API logic runs in two Supabase Edge Functions:

- **`sessions`** — creates sessions, serves question batches (80 per batch), accepts batched answer submissions, ends sessions
- **`analytics`** — aggregates answer history into summary stats, daily breakdowns, and per-question mistake frequency

The question bank (962 questions across all categories and difficulties) lives in Postgres and is seeded once from `seed.ts`. Answers are submitted in batches (piggybacked on the next-batch prefetch and the session-end request), reducing API calls from ~105 to ~3 per 100-question session.

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
