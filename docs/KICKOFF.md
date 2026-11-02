# Straight Answer (Trustworthy Ask-Your-Data Analyst): kickoff

Working title. Runs in parallel with the other builds, on the free tier. Needs one Gemini key (you already have one) and nothing else paid.

## Parallel-run note
All Claude Code sessions share your Pro plan limits. If a session pauses on a limit, resume with: "Read CLAUDE.md, docs/AUTOPILOT.md and the latest docs/sessions log, then continue where you stopped."

## Part 1: prerequisites (you, about 15 min)
1. [ ] **GitHub:** create an empty public repo `OluTechTalk/straight-answer` (no README, no .gitignore).
2. [ ] **Upstash:** you already have a Redis database. Either reuse it or create a second one named `straight-answer`. Save the REST URL and token.
3. [ ] **Gemini:** reuse your existing AI Studio key.
4. [ ] **Vercel:** nothing yet. You'll import the repo after the first push.

## Part 2: folder (you, about 5 min)
```powershell
cd C:\Users\oluak\Projects
mkdir straight-answer; cd straight-answer
mkdir docs, .claude
copy ..\shelfready\.claude\commands .claude\commands -Recurse
git init
git branch -M main
```
Save these into the folder:
- `analyst-CLAUDE.md` as `CLAUDE.md`
- `analyst-SPEC.md` as `docs\SPEC.md`
- `post-template.md` as `docs\POST_TEMPLATE.md`
- `design-quality-bar.md` as `docs\QUALITY_BAR.md`
- `design-tokens.css` into `docs\` (a skin for this product is chosen in P5)

## Part 3: start the autopilot
```powershell
claude --remote-control "Straight Answer" --permission-mode auto
```
Check the header shows `...\Projects\straight-answer`, then paste the prompt below. Put your keys in `.env.local` yourself first (copy `.env.example` once Claude creates it).

## Prompt
```
You're building Straight Answer (the Trustworthy Ask-Your-Data Analyst) on autopilot. Goal: finish phases P1 to P6 in docs/SPEC.md as fast as is safe while I'm mostly away. I'll check in from my phone through Remote Control. No recording this run.

STEP 0: SETUP
1. Save this whole prompt verbatim to docs/AUTOPILOT.md.
2. Read CLAUDE.md, docs/SPEC.md, docs/POST_TEMPLATE.md, docs/QUALITY_BAR.md and docs/design-tokens.css.
3. Scaffold: `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm` (move my docs aside first if it refuses, then restore them). Init shadcn/ui with defaults. Add scripts for lint, typecheck and test (Vitest). Create docs/DECISIONS.md, docs/sessions/, docs/posts/, .env.example (variable names only) and .gitignore with `!.env.example`. Add the first DECISIONS entries: "browser-side execution with DuckDB-WASM, model sees schema only", "no database in v1", "Gemini free tier default". Confirm `.env.local` has the keys by checking presence only; never print values. Commit, add remote https://github.com/OluTechTalk/straight-answer.git, push to main.

OVERRIDES TO CLAUDE.md FOR THIS RUN
- Don't wait for plan approval. For each phase, write a short plan into that phase's session log, then build.
- Pre-approved packages are listed in CLAUDE.md. Any other package: avoid if you can; if truly needed, add it and log why in DECISIONS.md.
- Commit after every slice, only when lint, typecheck and tests pass. Push at the end of each phase.

HARD RULES
- Secrets never printed, logged or committed.
- The model never receives rows from a dataset, only the question, the schema and the metric definitions.
- Generated SQL is untrusted: it must pass lib/sql guardrails (single SELECT, allowed tables, row limit, no file or network functions) before running, and the guardrails need unit tests including adversarial cases.
- All model output that becomes data uses Zod structured output.
- No invented numbers. Every figure traces to a saved eval run. Synthetic data is labelled synthetic.
- Gemini free tier: cache by content hash in evals, retry 429s with backoff, modest batch sizes, log tokens and latency per call.
- No force-push, no history rewrites.

PHASES, IN ORDER (baseline eval must run before the verification layer exists)
P1 Data: deterministic synthetic dataset generator (seeded), schema doc, metric definitions, and reference queries. CHECKPOINT: send me the dataset's tables and the list of metric definitions, one line each, so I can edit anything that feels off.
P2 Ask core: guardrails with tests, question-to-query with structured output, execution in DuckDB (node for tests, WASM in the app), plain answer.
P3 Eval baseline: 40 questions with gold answers computed by reference queries (mix per SPEC), runner measuring correctness, correct refusal, wrong-confident-answer rate, tokens, cost and latency. Run the baseline with no verification, save to evals/results/, commit. CHECKPOINT: send me the 40 questions grouped by type, so I can edit the tricky ones.
P4 Verification: static checks, semantic check, ambiguity handling, verdict states (Answered, Unsure, Refused). Settle the open question in SPEC (one call or two), log it in DECISIONS.md. Rerun the same 40 questions with the same model, save and commit. Report the before/after honestly even if it is worse.
P5 UI: question box, answer card with verdict (word plus shape, not color alone), detail drawer (query, rows, definitions, checks, model), CSV upload (single table), exports (Markdown, CSV, JSON), restore link, "How to read this result" page, empty, loading, error and offline states, before/after chart. Use a skin from docs/design-tokens.css or propose a new one in DECISIONS.md. Check 375px, light and dark, keyboard, 44px targets. CHECKPOINT: tell me it's deployable and I'll import it into Vercel.
P6 Ship: Upstash rate limit on /api/ask, demo mode serving cached answers for example questions, social preview image, axe check in CI, size budget in README and enforced in CI, README (60-second quickstart, mermaid architecture diagram, results from saved runs, limitations, licence), docs/case-study.md with sections Customer and problem, Strategy and scope, What I built, Key decisions, Results, What broke, Next steps, Links, and docs/launch-post.md.

CHECKPOINTS (stop and send ONE short message I can answer from my phone, otherwise keep going)
1. A new env var, secret or paid service is needed.
2. Dataset and metric definitions ready for review.
3. The 40 questions ready for review.
4. The app is deployable to Vercel.
5. Stuck on the same error about 30 minutes, or a decision would change scope.
6. All phases done.

BOOKKEEPING
At the end of each phase: write docs/sessions/NN-slug.md, update Current status in CLAUDE.md, write docs/posts/NN-slug.md using docs/POST_TEMPLATE.md (facts only, no secrets), commit and push. If you hit usage limits, make sure the next session can resume from docs/AUTOPILOT.md, CLAUDE.md's status block and the latest session log alone.

Start with STEP 0 now.
```

## After it finishes
1. [ ] Import the repo in Vercel and set the env vars there.
2. [ ] Optional: add `straight-answer.oluakele.com` (CNAME at Porkbun).
3. [ ] Portfolio: flip the card to in-progress or shipped, add the headline number from the saved eval, and pull in the posts from `docs/posts/`.

## Done when
- [ ] Repo pushed with README, case study draft and committed before/after eval results
- [ ] Live demo on Vercel where a stranger can upload a CSV and get an answer with a visible query and verdict
- [ ] Headline reads "Wrong confident answers X% to Y%" with X and Y from saved runs
