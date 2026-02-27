# Cycle 02: Orient

## Problem

Cycle 01 gave us a working task editor — blocks have tasks, tasks persist, commands can read/write them. But the app still has no memory beyond today. Every day starts blank. There's no weekly intention to anchor against.

Cal Newport's system lives or dies on the **weekly plan**. Without it, the daily view is just a fancy to-do list. And the `orient` command — the one verb that makes this useful for AI Browser — has nowhere to pull context from. It currently returns generic suggestions like "break down first task into smaller steps" regardless of what you actually planned to focus on this week.

The gap: **daily blocks float free, disconnected from any weekly intention.**

## Appetite

**1 week (5 days)** — Small batch.

## Solution (Breadboard)

### Places

- **Week panel** — A lightweight sidebar or section above the daily table. Not a full page. Just enough to hold the week's intentions.
- **Daily table** — Unchanged structure, but block names and `orient` output now reference the weekly plan.
- **Command input** — `orient day` now returns something grounded.

### Elements: Week Panel

```
[Week Panel]
  week of: Feb17-21

  this week I want to:
  ┌──────────────────────────────────┐
  │ 1. finish project proposal       │  ← textarea, one line per intention
  │ 2. clear email backlog           │
  │ 3. exercise 3x                   │
  └──────────────────────────────────┘
  [done]   (collapses panel, saves)
```

### Elements: `orient` Output (with weekly context)

```
orient day →

  week intentions:
  ○ finish project proposal
  ○ clear email backlog
  ✓ exercise 3x

  today's blocks:
  09:00am — 2 tasks, 0 done
  10:00am — empty
  ...

  suggested focus: "finish project proposal" (unblocked, high value)
  blocked time: 4hrs unplanned — consider carving deep work
```

### Connections

- Week panel opens with `orient week` or a "week" button
- Intentions are plain text, one per line (same textarea philosophy as Cycle 01)
- `orient day` pulls weekly intentions → compares to day's blocks → suggests focus
- `orient block` stays local (current block tasks only)
- Weekly intentions stored under a `week_intentions_[week-key]` storage key

## Scope (Hill Chart)

### Uphill (Figuring out)
1. **Weekly intentions data model** — What does a "weekly intention" actually store? Just text? A completion state? Linked to a goal?
2. **`orient` output format** — What does useful orientation look like? Enough signal without noise.

### Downhill (Executing)
3. **Week panel UI** — Textarea + save, same pattern as block editor
4. **Weekly storage** — Simple key/value, same pattern as daily
5. **`orient` implementation** — Replace the `expandNow` stub with real logic that reads both weekly + daily state
6. **Router fix** — Rename `expand` → `orient` in `router.js` to match `commands.md`

## Rabbit Holes to Avoid

- ❌ Weekly *schedule* (mapping intentions to specific days)
- ❌ Completion tracking on weekly intentions (just text for now)
- ❌ Rolling over uncompleted intentions to next week
- ❌ Goal hierarchy above weekly (quarterly/yearly — future cycle)
- ❌ Visual alignment scores or percentages
- ❌ AI-generated intention suggestions

## No-Gos (Out of Bounds)

- Full weekly table/calendar view
- Quarterly goal system
- Intention-to-block linking (drag/drop or assignment)
- Any backend, sync, or multi-device

## Cleanup (Included — Low Risk)

These are quick fixes that unblock Cycle 02 and clean up Cycle 01 debt:

- Fix `pivot()` — currently references old column-based DOM model, won't work
- Remove dead module files from `src/` — `dom-helpers.js`, `storage.js`, `state-queries.js`, `utilities.js`, `namespaces.js`, `initialization.js` (none loaded by `index.html`)
- Rename `expand` → `orient` in `router.js`

## Success Criteria (Test Cases)

1. ✅ Can open week panel and type 3 weekly intentions
2. ✅ Intentions persist after reload
3. ✅ `orient day` returns weekly intentions alongside day state
4. ✅ `orient block` still works (local context, no weekly)
5. ✅ `orient week` returns weekly intentions summary
6. ✅ `pivot` works correctly in the single-column model
7. ✅ Dead module files removed, `src/` is clean

## Circuit Breaker

**If by Day 3** the `orient` output isn't feeling useful:
- **Simplify:** Drop the day-vs-weekly comparison
- **Fallback:** `orient day` just returns day state (what `get day` already does, but formatted for humans)
- **Still counts as shipped:** Week panel + working intentions storage

## Deliverables

- Week panel (textarea, save, persist)
- `orient` implemented for block/day/week scopes
- `router.js` updated (`expand` → `orient`)
- `pivot` fixed for single-column model
- Dead module files removed
- `docs/cycle-02/reference.md` with updated data model

## Next Cycle Preview

Once `orient` works with weekly context, Cycle 03 can add:
- Quarterly goals (one level up from weekly)
- Alignment indicators (visual signal when daily blocks drift from weekly plan)
- Shutdown ritual with week-in-review prompt
