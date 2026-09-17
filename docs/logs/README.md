# Session logs

One note per working session, `YYYY-MM-DD.md`. This directory is the whole
record of Steampunk Shuffle. Entries dated 2026-09-10 to 2026-09-15 were
migrated from the root `CLAUDE.md` on 2026-09-16 (tagged `migrated`, text
verbatim, one `## Also this session` block per plan step); entries from
2026-09-16 on are written at session end. `CLAUDE.md` keeps only a short
`## Current state` pointer and the standing `## Gotchas`.

A session that adds to an existing day's note appends under a horizontal rule
and `## Also this session: <topic>`. Nothing prior is reordered or deleted.

Written by the brent-ops `/log` skill and read by `/next`, `/daily` and
`/weekly`. Voice rules are the plugin's `references/voice.md`: no em-dashes,
no exclamation points, brevity, real paths and real counts, nothing invented.

## Template

```markdown
---
title: "Log — YYYY-MM-DD"
date: YYYY-MM-DD
tags: [log]
status: active
---

## What I worked on

One or two sentences: the plan steps or PT items in play, and the focus.

## What got done

- **Bolded claim.** Detail with the path, the count, the commit, the step id.

## Decisions made

- Decision, rationale, and who made it. Name the rejected alternative.

## Open questions / blockers

- Anything unresolved, including uncommitted paths and design checks owed
  to Brent.

## Next session

- The first move, with the file to open. Commands in their own fenced
  blocks, one per block.

## Related

- [steampunk-shuffle-plan.md](../../steampunk-shuffle-plan.md) §<step>
- [PLAYTEST.md](../../PLAYTEST.md) PT-<n>
```

## Rules

- **Omit a section rather than pad it.** An empty section is worse than a
  missing one.
- **Ids.** Plan steps are `<phase>.<step>[letter]` (`1.3`, `4.0b`); playtest
  notes are `PT-<n>`. Every id in a log exists in the plan or `PLAYTEST.md`.
- **Step state lives in the plan and the playtest file**, not here. When a
  step is done or a PT item is fixed, the log says so and names the line
  that changed in `steampunk-shuffle-plan.md` or `PLAYTEST.md`.
- **Commits are Brent's.** A log never stages, commits or pushes. `## Next
  session` ends with the `ss-ship` line when there is something to ship, and
  `## Open questions / blockers` lists every path `git status --short` shows.
- **Model.** Say which model did the session's work when it differs from the
  plan's assignment, and why.
