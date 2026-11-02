---
slug: straight-answer-ep01-data
project: straight-answer
episode: 01
title: Building the dataset first, with traps on purpose
date: 2026-11-02
summary: A deterministic synthetic dataset and a glossary of metric definitions, with a reference query and a test for every metric.
pmTakeaway: An analyst can only be graded against a definition of "right", so the definitions come before the model.
buildTakeaway: A seeded generator plus an independent JS computation gives gold answers that do not depend on any SQL I wrote for the model.
commit: pending
---

## Log post (400-700 words, for the site)
**The goal this episode.** Create the data the analyst will be tested on, and write down what each business word means, before any model call exists.

**The product call.** The dataset is synthetic and labelled that way everywhere. It has four tables (regions, customers, products, orders) and ten metric definitions such as revenue, refund rate and active customers. I put traps in on purpose: `order_total` is before discount, order region is the shipping region while customer region is the billing region, and `signup_date` is not the first purchase. These are the mistakes a confident-but-wrong analyst makes. I gave up realism for control: a small clean dataset means every gold answer can be checked.

**What shipped.** A seeded generator (same output every run, 5,000 orders, 400 customers, 30 products, 5 regions), a schema doc, a metric glossary with ambiguous terms and time conventions, and a Node DuckDB loader.

**What broke.** Vitest would not install against the scaffold's Node types until I raised `@types/node` to 24.

**The number.** 16 passing tests: every one of the 10 metric reference queries matches an independent JavaScript computation.

## Next
Guardrails for model-written SQL, then the first question-to-query path.
