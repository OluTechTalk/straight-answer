# Episode post template

Save as `docs/POST_TEMPLATE.md` in every project repo (ShelfReady, Red Pen, and each later build). One file per phase or episode, written to `docs/posts/NN-slug.md`. The portfolio site imports these into `/log`, so keep the frontmatter field names exactly as shown.

## Rules
- Facts only, from the session log, `docs/DECISIONS.md`, files in `results/`, and commits. No invented numbers. Every number must trace to a saved run or a commit.
- Never include secrets, API keys, tokens, store domains, IDs or env values, even redacted.
- Synthetic data is called "synthetic" in the post.
- Every post shows both halves: the PM view (who it's for, the call, the trade-off) and the builder view (what shipped, what broke, the number).
- If a section has nothing real yet, write "nothing yet" instead of filling it.

## Template

```markdown
---
slug: <project>-epNN-<short-slug>
project: <project slug, e.g. shelfready or redpen>
episode: NN
title: <plain, specific title>
date: YYYY-MM-DD
summary: <one sentence>
pmTakeaway: <the product lesson in one line>
buildTakeaway: <the technical lesson in one line>
metric: <one real number from this episode, or omit>
commit: <link to the phase's last commit>
---

## Log post (400-700 words, for the site)
**The goal this episode.** What I set out to do and why it matters to the customer.
**The product call.** The decision or trade-off I made as a PM (scope, cost, sequencing), and what I gave up.
**What I built.** 3-5 bullets, plain language.
**What broke.** The surprise or bug, and how it was fixed.
**The number.** The metric from this episode, and where it came from.
**Next episode.** One line.

## LinkedIn post (150-250 words)
- Hook: first line under about 12 words, a tension or a surprise, not "Excited to share".
- 3-5 short lines: the problem, the call I made, what broke, the number.
- One lesson for PMs and builders.
- CTA: link to the log post.
- 3 hashtags max.

## Short post (280 characters or fewer)
One insight plus the link.

## Video notes (optional, only if I record this one)
- A 60-90 second talk track in 3 bullets.
- The one thing to show on screen (a terminal, a chart, a result).

## Visual (optional)
Which screenshot, chart or diagram to attach.
```
