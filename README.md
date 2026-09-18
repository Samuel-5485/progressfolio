# ProgressFolio

> Turn your commits into a portfolio that proves you ship.

An AI-powered, GitHub-driven portfolio that automatically turns a student
builder's real shipping activity into a clean, living timeline of proof.

## Stack

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS v4
- **Backend / DB / Auth / Storage:** Supabase
- **AI:** Google Gemini Flash-Lite only (see [`src/lib/ai/gemini.ts`](src/lib/ai/gemini.ts)) - no other provider
- **GitHub:** REST API (`octokit`) + webhooks
- **Hosting:** Vercel

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then run
   [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor to create tables,
   RLS policies, and the `entry-media` storage bucket.

3. **Create a GitHub OAuth App** at
   [github.com/settings/developers](https://github.com/settings/developers).
   Set the callback URL to `https://<your-project-ref>.supabase.co/auth/v1/callback`
   (find `<your-project-ref>` in your Supabase project URL). Then in the
   Supabase dashboard, go to **Authentication → Sign In / Providers → GitHub**,
   enable it, and paste the Client ID + Secret there - Supabase handles the
   OAuth exchange itself, so these credentials live in Supabase, not `.env.local`.

4. **Get a Gemini API key** at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

5. **Copy the env template** and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

6. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

7. **(Optional, production only) GitHub push webhooks.** Set
   `GITHUB_WEBHOOK_SECRET` to a random string and `NEXT_PUBLIC_SITE_URL` to
   your deployed `https://` URL. When both are set, connecting a repo
   automatically registers a webhook at `/api/webhooks/github` so new pushes
   sync near-instantly instead of waiting for "Sync now". This is skipped
   automatically on `localhost` since GitHub can't reach it.

8. **Polar billing.** Run [`supabase/migrations/20260917_polar_billing.sql`](supabase/migrations/20260917_polar_billing.sql)
   in the Supabase SQL editor (or the full [`schema.sql`](supabase/schema.sql)
   on a fresh project). Create matching recurring products in Polar
   (Pro Monthly $9, Pro Yearly $86) for **sandbox** (local/preview) and
   **production** (Vercel Production) — use separate product IDs and
   tokens per environment. See the Polar section below.

## Project structure

```
src/
  app/
    dashboard/         Draft inbox, weekly post, manual log entry
    onboarding/         GitHub connect + repo picker + first import
    u/[username]/       Public portfolio page
    api/webhook/polar/ Polar subscription webhooks
    checkout/          Polar checkout (monthly | yearly)
    portal/            Polar customer portal
  lib/
    billing/           isPro() + webhook subscription sync
    polar.ts           Polar env/product helpers
    supabase/          Browser + server + service-role Supabase clients
    ai/gemini.ts        The only AI entry point (Gemini Flash-Lite)
    github/             Octokit client, commit import, webhook registration
    timeline/           Daily entry generation, weekly share post
    types.ts            Types mirroring supabase/schema.sql
  proxy.ts             Session refresh (Next.js 16 replacement for middleware.ts)
supabase/
  schema.sql           Tables, RLS policies, storage bucket
```

## AI model policy

This project uses **Google Gemini Flash-Lite exclusively** for all text
rewriting/summarization. See [`.cursor/rules/ai-model-policy.mdc`](.cursor/rules/ai-model-policy.mdc).
Do not add OpenAI/Claude/other providers unless explicitly requested.

## Polar billing

Checkout lives at `/checkout?plan=monthly|yearly`, the customer portal at
`/portal`, and Polar webhooks at `POST /api/webhook/polar`.

`POLAR_SERVER=sandbox` uses Polar sandbox (local and Vercel Preview).
Any other value, including `production`, uses Polar production.

Production webhook URL:

`https://progressfolio.vercel.app/api/webhook/polar`

Local Polar webhooks (ngrok):

```bash
ngrok http 3000
```

In Polar (sandbox for local, production for Vercel): Settings → Webhooks →
Add endpoint `https://<host>/api/webhook/polar`. Enable
`subscription.created`, `subscription.active`, `subscription.updated`,
`subscription.canceled`, `subscription.revoked`, and
`subscription.past_due`. Paste the signing secret into
`POLAR_WEBHOOK_SECRET`.
