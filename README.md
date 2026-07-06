# Reforge — Starter C ode

This is a working skeleton, not a finished product. It has real login, a real
database connection, and a real email-sending function — but the two hardest
pieces (pulling live data from Meta, and the actual Meta login flow) are left
as clearly marked stubs, because they need your own API keys and testing
against a real ad account.

## What's already built
- Sign up / log in (Clerk)
- A dashboard page that reads fatigue data from a database (Supabase)
- The fatigue-scoring formula (`lib/fatigue.ts`)
- An email alert function (Resend)
- A scheduled job structure (runs every 6 hours once deployed)

## What you (or a developer) still need to build
- The real Meta OAuth connection (`app/api/meta/connect/route.ts`)
- The real Meta API call that pulls ad performance data (`fetchMetaAdMetrics` inside `app/api/cron/check-fatigue/route.ts`)

Both are marked with `STARTER STUB` comments in the code.

---

## How to get this running — step by step

You don't need to understand code to do steps 1-6. You're just creating
accounts and copying keys into one file.

### 1. Create accounts (all have free tiers)
- [supabase.com](https://supabase.com) — create a new project
- [clerk.com](https://clerk.com) — create a new application
- [resend.com](https://resend.com) — create an account, get an API key
- [vercel.com](https://vercel.com) — create an account (for deploying later)

### 2. Set up the database
- In Supabase, go to **SQL Editor** → **New Query**
- Open `supabase/schema.sql` from this project, copy everything in it
- Paste into the Supabase SQL editor and click **Run**
- This creates the 3 tables the app needs

### 3. Get your keys
- **Supabase:** Project → Settings → API → copy the Project URL and the two keys
- **Clerk:** Dashboard → API Keys → copy both keys
- **Resend:** API Keys → create one → copy it

### 4. Fill in your environment file
- Duplicate `.env.example`, rename the copy to `.env.local`
- Paste each key into the matching line

### 5. Install and run locally
If you have a developer helping, they'll run:
```
npm install
npm run dev
```
This starts the app at `http://localhost:3000` on their computer, so you can
click through sign-up, log-in, and the dashboard before it's live for anyone
else.

### 6. Deploy it so it's live on the internet
- Push this code to a GitHub repository
- In Vercel, click **New Project**, connect that GitHub repo
- Paste the same environment variables from `.env.local` into Vercel's
  "Environment Variables" settings
- Click **Deploy**
- Vercel gives you a live URL (like `reforge-app.vercel.app`) — that's your
  actual website, live, that anyone can visit

### 7. The two hard parts (do these last, once everything else works)
- **Meta app setup:** create an app at developers.facebook.com, get your
  `META_APP_ID` and `META_APP_SECRET`, and finish the OAuth flow in
  `app/api/meta/connect/route.ts`
- **Pulling real ad data:** replace the `fetchMetaAdMetrics` stub with a real
  call to Meta's Marketing API Insights endpoint

These two are genuinely the most technical part of the whole build. This is
the point where, if you're not coding yourself, it's worth paying a developer
for a focused chunk of hours — just for this piece — rather than the whole
project.

---

## A note on the trimmed stack

PostHog, Sentry, Cloudflare, Upstash, and Pinecone were intentionally left
out of this starter. Add them later, in this order, once they're actually
needed:
1. **Cloudflare** — when you buy a custom domain
2. **Sentry** — once you have users other than yourself hitting bugs
3. **PostHog** — once you have enough users that gut-feel isn't enough
4. **Upstash** — only if a scheduled job or feature needs a queue/cache
5. **Pinecone** — only if you build AI-generated creative variants later
