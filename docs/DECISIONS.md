# Decisions

Dated entries for real tradeoffs. Format: decision, options considered, why.

## 2026-11-02: Browser-side execution with DuckDB-WASM; the model sees the schema only
- **Decision:** Queries run in the visitor's browser with DuckDB-WASM. The model receives the question, the schema and the metric definitions, never rows.
- **Options:** (a) server-side DuckDB or Postgres with the data hosted by us; (b) send sample rows to the model for context; (c) browser-side execution.
- **Why:** Uploaded data never leaves the browser, which is the trust story for strangers who bring their own data. Sample rows would improve accuracy on some questions but break that promise. Cost: the model cannot peek at value formats, so the schema doc and metric definitions have to carry that information.

## 2026-11-02: No database in v1
- **Decision:** No Neon or other database. Eval results are checked-in JSON in `evals/results/`. Upstash Redis is used only for rate limiting.
- **Options:** Neon Postgres for history and eval storage; checked-in JSON.
- **Why:** v1 has no accounts and no saved history, so a database adds setup and failure modes for no user value. Checked-in JSON also makes every number in the README traceable to a commit.

## 2026-11-02: Gemini free tier as the default model
- **Decision:** Default model is set in `lib/ai/models.ts`, starting on the Gemini free tier via the Vercel AI SDK.
- **Options:** Paid frontier models; Gemini free tier.
- **Why:** The project must run at no cost. The tradeoff is rate limits (retry 429s with backoff, cache eval calls by content hash) and a weaker baseline model. A weaker baseline is acceptable because the claim is relative: the same model before and after the verification layer. Swapping the model is a one-line change.

## 2026-11-02: Vitest for tests
- **Decision:** Add `vitest` as the test runner.
- **Options:** Jest; Node's built-in test runner; Vitest.
- **Why:** The kickoff prompt names Vitest explicitly. It handles TypeScript and the `@/*` alias with minimal config. Not on the CLAUDE.md pre-approved list, so logged here.

## 2026-11-02: Quality bar and design tokens missing at kickoff
- **Decision:** `docs/QUALITY_BAR.md` and `docs/design-tokens.css` were not in the repo at kickoff. `docs/POST_TEMPLATE.md` was copied from the portfolio repo's `docs/POST_TEMPLATE.md`.
- **Why:** Recorded so nobody assumes those two files were read. Design tokens are only needed in P5.
