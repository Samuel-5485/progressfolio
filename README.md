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
   Set the callback URL to `<NEXT_PUBLIC_SITE_URL>/auth/callback`.

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

## Project structure

```
src/
  app/                 Routes (App Router)
  lib/
    supabase/          Browser + server Supabase clients
    ai/gemini.ts        The only AI entry point (Gemini Flash-Lite)
    types.ts            Types mirroring supabase/schema.sql
  proxy.ts             Session refresh (Next.js 16 replacement for middleware.ts)
supabase/
  schema.sql           Tables, RLS policies, storage bucket
```

## AI model policy

This project uses **Google Gemini Flash-Lite exclusively** for all text
rewriting/summarization. See [`.cursor/rules/ai-model-policy.mdc`](.cursor/rules/ai-model-policy.mdc).
Do not add OpenAI/Claude/other providers unless explicitly requested.
