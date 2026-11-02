# Straight Answer: SPEC (v0 draft)

Working title. Everything here is a proposal for Olu to edit. Numbers marked TBD are measured, never promised.

## Customer and problem
A non-technical team member (ops, sales, finance) who needs a number from a spreadsheet or database and has no analyst on hand. Existing AI analysts answer fast and confidently, and often wrongly, and the person can't tell the difference.

## The bet
Make wrongness visible and rare:
1. Show the work: the query and the rows behind every answer.
2. Verify before answering: sanity checks plus a second pass that compares the query to the question.
3. Refuse when it should: ambiguous or unanswerable questions get a clear "I can't answer that reliably, and here's why" with a suggested clarifying question.
4. Prove it: an eval set measures correctness and refusal behavior before and after the verification layer, with the same model.

## Scope (v1)
- Dataset: one synthetic, clearly labeled dataset (orders, customers, products, regions), generated deterministically with a seed.
- Upload your own: CSV only, loaded into DuckDB-WASM in the browser. Rows never reach a server or the model.
- Metric definitions: a small glossary ("revenue" = sum of order total after discounts, excluding refunds) that the model must use and the UI displays.
- Ask flow: question, then generated query (structured output), guardrails, run in browser, verification, verdict.
- Verdict states: Answered (checks passed), Unsure (answer shown with named doubts), Refused (no answer, reason and suggested follow-up).
- Detail one tap away: query, rows, metric definitions used, checks run, model and version.
- Output: copy or download answer as Markdown, CSV and JSON, plus a link that restores the question and dataset choice.
- "How to read this result" page: what the verdict means and what it does not prove.

## Out of scope for v1
- Database connections, multi-table joins beyond the example schema for uploaded data (uploads support a single table), charts beyond one simple auto-chart, user accounts, saved history, write queries.

## Verification layer (the core of the project)
- Static checks: SQL guardrails; result is non-empty when the question implies one; result shape matches the question (one number for "how many", a ranked list for "top N").
- Semantic check: a second model call, with structured output, that restates what the query computes in plain English and compares it with the question. Disagreement lowers the verdict to Unsure or Refused.
- Ambiguity check: questions that match more than one metric definition or time window trigger a clarifying question instead of a guess.
- Open question to settle in Phase P2: whether the semantic check and the ambiguity check are one call or two (cost versus accuracy). Log the answer in DECISIONS.md.

## Eval design
- 40 questions with gold answers computed from the synthetic dataset by hand-written reference queries. Mix: straightforward (about half), needs a metric definition, ambiguous (should ask or refuse), unanswerable from the data (should refuse), misleading column names, and time-window traps.
- Measures: answer correctness, correct refusal rate, wrong-confident-answer rate (the number that matters most), tokens and cost per question, latency.
- Run order matters: baseline (model writes a query, no verification) first, then with the verification layer, same model and same questions. Commit both results.
- Headline format: "Wrong confident answers X% to Y%; correct refusals X% to Y%." Filled from saved runs only.

## Phases
- P1 Data: scaffold, synthetic generator, schema, metric definitions, ground-truth reference queries
- P2 Ask core: guardrails with tests, question-to-query with structured output, run in DuckDB, plain answer
- P3 Eval baseline: 40 questions, runner, baseline results committed
- P4 Verification: static checks, semantic check, ambiguity handling, verdict states, rerun evals
- P5 UI: question box, answer card, detail drawer, CSV upload, exports, restore link, how-to-read page, empty and error states
- P6 Ship: rate limiting and demo mode, README with architecture diagram, case study draft, launch post draft, social preview image, axe in CI, size budget

## Success criteria
- The verification layer reduces the wrong-confident-answer rate versus baseline on the saved eval, and the result is committed, whichever direction it goes. If it doesn't help, the case study says so.
- A stranger can upload a CSV and get an answer with visible query and verdict in under a minute.
- Passes the checklist in docs/QUALITY_BAR.md.
