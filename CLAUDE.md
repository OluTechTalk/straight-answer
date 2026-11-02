# Trustworthy Ask-Your-Data Analyst (working title: "Straight Answer")

Portfolio build 02 of the forward-deployed-PM series. A person asks a plain-English question about a dataset. The system writes a read-only query, runs it, and returns the answer together with the query, the rows behind it, and a verdict on how far to trust it. When it can't answer reliably, it says so instead of guessing. An eval set backs the claim with before/after numbers.

PM story: every team has a "just ask the data person" bottleneck, and AI analysts fail quietly with confident wrong numbers. The bet is to measure how often the analyst is right, add a verification layer, and make it refuse when it isn't sure. Scope lives in @docs/SPEC.md.

## Current status
<!-- /end-session updates this block. Keep it to 5 lines. -->
- Phase: P1 Data done, awaiting Olu review (checkpoint 2)
- Last session: docs/sessions/01-data.md
- Next target: P2 Ask core (guardrails, question-to-query, DuckDB execution). Needs GOOGLE_GENERATIVE_AI_API_KEY in .env.local
- Blockers: docs/QUALITY_BAR.md and docs/design-tokens.css missing; .env.local missing
- Data: all datasets are SYNTHETIC unless the user uploads their own

## Stack
- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, deployed on Vercel Hobby
- Vercel AI SDK for all model calls; default model set in `lib/ai/models.ts` (Gemini free tier). Key in `GOOGLE_GENERATIVE_AI_API_KEY`.
- Queries run in the visitor's browser with DuckDB-WASM. Uploaded data never leaves the browser. The model receives only the question, the schema and the metric definitions, never rows.
- Evals run locally in Node with `@duckdb/node-api` against the same synthetic dataset, and results are written to `evals/results/`.
- Neon Postgres is NOT used in v1. Eval results are checked-in JSON. Upstash Redis for rate limiting on the one model route.
- Pre-approved packages: zod, ai, @ai-sdk/google, @duckdb/duckdb-wasm, @duckdb/node-api, @upstash/ratelimit, @upstash/redis, papaparse, recharts, @playwright/test and @axe-core/playwright (tests only). Ask before adding anything else.

## Repo layout
- `app/` UI pages and the single model route (`/api/ask`)
- `lib/sql/` SQL guardrails: parse, allow-list, read-only enforcement, row limit
- `lib/ask/` question-to-query, verification checks, refusal logic
- `lib/data/` dataset loading, schema extraction, metric definitions
- `data/` synthetic dataset generator (deterministic, seeded) and its output
- `evals/` question set with gold answers, runner, results
- `docs/` SPEC, DECISIONS, case-studies notes, sessions, posts, POST_TEMPLATE

## Commands
- `npm run dev` local app
- `npm run lint && npm run typecheck && npm test` run before every commit
- `npm run gen:data` regenerate the synthetic dataset (deterministic)
- `npm run eval` run the question set and write results to `evals/results/`
- `npm run build` production build

## Rules
- Small slices. Commit only when lint, typecheck and tests pass.
- All model output that becomes data uses structured output (Zod schemas), never free-text parsing.
- Generated SQL must pass the guardrails in `lib/sql/` before it runs: single SELECT statement, allowed tables only, row limit, no functions that read files or the network. The model's output is never trusted.
- Unknown stays unknown. "Answered", "refused" and "unsure" are three different states with different words and shapes, never color alone.
- No invented numbers. Every number on screen, in the README and in posts traces to a saved eval run in `evals/results/` or to the user's own data. Synthetic data is called synthetic everywhere.
- Secrets live only in `.env.local` and Vercel env vars. Never print, log or commit them. Keep `.env.example` current.
- The model route is rate-limited (Upstash) and has a demo mode that serves cached answers for the example questions.
- Log tokens and latency for every model call in eval runs, so the case study has cost numbers.
- Keep dependencies minimal; ask before adding a package outside the pre-approved list.
- When you make a real tradeoff, add a dated entry to `docs/DECISIONS.md` (decision, options considered, why).
- Quality bar: every slice must satisfy the checklist in `docs/QUALITY_BAR.md` (strangers who bring their own data).

## Session workflow
- Start with `/start-session`: read this file, the latest file in `docs/sessions/`, and `docs/DECISIONS.md`, then restate today's target.
- End with `/end-session`: write the session log, update "Current status" above, write `docs/posts/NN-slug.md` using `docs/POST_TEMPLATE.md` (no secrets), and suggest a commit message.
