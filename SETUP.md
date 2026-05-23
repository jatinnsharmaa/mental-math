# Setting Up Your Own Instance

This guide walks you through forking this project and deploying it as your own app. You'll end up with your own Supabase project (database + edge functions) and your own Vercel deployment.

## Prerequisites

- Node.js 18+
- [Deno](https://deno.land) (for edge function tests)
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)
- [Vercel CLI](https://vercel.com/cli): `npm i -g vercel`
- [Supabase CLI](https://supabase.com/docs/guides/cli): included as a dev dependency (`npx supabase`)

---

## Step 1: Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users
3. Note your **Project Reference ID** (e.g. `abcdefghijklmnop`) — it's in the URL of your project dashboard

From your project dashboard, collect these values:

| Value | Where to find it |
|-------|-----------------|
| `DATABASE_URL` | Settings → Database → Connection string → URI (use the "Transaction" mode URL) |
| `SUPABASE_URL` | Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → Service role secret |
| `SUPABASE_PUBLISHABLE_KEY` | Settings → API → Publishable (anon) key |

---

## Step 2: Configure environment files

**Root `.env`** (copy from `.env.example`):
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

**`frontend/.env.local`** (create this file):
```
VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[YOUR-PUBLISHABLE-KEY]
VITE_API_URL=http://localhost:54321/functions/v1
```

**`frontend/.env.production`** (create this file):
```
VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[YOUR-PUBLISHABLE-KEY]
VITE_API_URL=https://[PROJECT-REF].supabase.co/functions/v1
```

---

## Step 3: Push the database schema

```bash
npx prisma db push
```

This creates the `Question`, `Session`, and `SessionAnswer` tables in your Supabase Postgres.

After running it, grant the necessary Supabase roles access (Prisma-created tables don't get this automatically). Run this in the Supabase SQL editor:

```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated, service_role, anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role, anon;
```

---

## Step 4: Seed the question bank

```bash
npx tsx seed.ts
```

This inserts 962 questions across all categories and difficulties. It clears all existing sessions and answers first (to avoid foreign key conflicts), then re-seeds — safe to run again if something goes wrong.

---

## Step 5: Deploy the Edge Functions

Log in to the Supabase CLI:

```bash
npx supabase login
```

Link to your project:

```bash
npx supabase link --project-ref [YOUR-PROJECT-REF]
```

Deploy both functions:

```bash
npx supabase functions deploy sessions
npx supabase functions deploy analytics
```

The functions read `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` automatically from the Supabase environment — no secrets to set manually.

---

## Step 6: Deploy the frontend to Vercel

```bash
cd frontend
vercel --prod
```

Follow the prompts to link to your Vercel account. When asked for environment variables, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_URL` (use the production value: `https://[PROJECT-REF].supabase.co/functions/v1`)

Or set them in the Vercel dashboard under Project → Settings → Environment Variables.

Optionally set a clean alias:

```bash
vercel alias [deployment-url] [your-chosen-name]
```

---

## Step 7: Configure Supabase Auth

In your Supabase dashboard, go to **Authentication → URL Configuration**:

- **Site URL**: set to your Vercel deployment URL (e.g. `https://your-app.vercel.app`)
- **Redirect URLs**: add `https://your-app.vercel.app/**`

This ensures email confirmation and password-reset links point to your app.

---

## Running locally

Start the Supabase local stack (requires Docker):

```bash
npx supabase start
npx supabase functions serve --env-file .env
```

Then in a separate terminal:

```bash
cd frontend
npm run dev
```

The frontend dev server proxies to local edge functions via `VITE_API_URL=http://localhost:54321/functions/v1` in `.env.local`.

---

## Customising the question bank

Questions are generated in `seed.ts` via the `buildQuestions()` function. Each question has:

| Field | Type | Values |
|-------|------|--------|
| `category` | string | `multiplication`, `primes`, `squares_cubes`, `roots`, `fractions` |
| `difficulty` | string | `easy`, `medium`, `hard` |
| `prompt` | string | The question text |
| `answer` | string | The correct answer (always a string) |

To add a new category:
1. Add question generation logic to `buildQuestions()` in `seed.ts`
2. Update distractor generation in `_shared/distractors.ts`:
   - Integer-answer categories (like squares_cubes, multiplication): use the `correct ± k×10` block — options automatically share the correct answer's last digit
   - Decimal-answer categories (like roots, fractions): add an entry to the `deltas` map with appropriate decimal offsets
3. Add the category to `CATEGORIES` in `frontend/src/components/SessionConfig.tsx` and in `DashboardPage.tsx`
4. Re-run `npx tsx seed.ts`
