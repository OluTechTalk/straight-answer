# Session 01: P1 Data (autopilot)

## Plan
- Deterministic seeded generator in `data/generate.ts` (no deps, run with `npm run gen:data`), CSV output in `data/out/`.
- Four tables per SPEC: regions, customers, products, orders. Deliberate traps: misleading column names, shipping vs billing region, price drift, cancelled/pending/refunded statuses.
- `lib/data/schema.ts` (schema doc the model sees) and `lib/data/metrics.ts` (glossary with SQL, ambiguous terms, time conventions), plus `docs/DATASET.md`.
- Reference queries per metric, validated in tests against an independent JS computation, using `@duckdb/node-api`.
- Checkpoint: send the tables and metric list to Olu.

## What was done
- STEP 0: scaffolded Next.js (App Router, TS, Tailwind), shadcn/ui, Vitest. Pushed to origin/main. Saved the prompt to `docs/AUTOPILOT.md`.
- `@types/node` bumped from 20 to 24 because Vitest 5 would not install against 20 (peer conflict).
- P1: generator, schema doc, 10 metric definitions with reference SQL, ambiguous-term list, time conventions, Node DuckDB loader, 16 passing tests (generator determinism, key integrity, every metric reference query vs JS).

## Issues
- `docs/QUALITY_BAR.md` and `docs/design-tokens.css` were not in the repo and not found elsewhere on this machine. Not read. Logged in DECISIONS.md. `POST_TEMPLATE.md` was copied from the portfolio repo.
- `.env.local` does not exist. Needed from P2 (Gemini key) and P6 (Upstash).

## Next
- Olu reviews tables and metric definitions. Then P2 Ask core.
