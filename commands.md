# Infinite Frontiers — Command Reference

## Natural Language Command System

Commands use the format: `verb [scope] [params]`

Example: `orient day`, `carve 90min deep work`, `pivot`

---

## Core Verbs

### `orient [scope]`
Read the room, suggest next moves.

**Scopes:** block (default), day, week

**Behavior:**
- Reads current state (tasks, completion, time remaining)
- Considers carved blocks (protected time)
- Suggests actions: getStarted, makeProgress, finish
- Day scope incorporates year/quarter/week/yesterday's shutdown
- Week scope incorporates year/quarter context
- Returns structured data (for AI chaining)
- Returns human-readable summary

**Examples:**
- `orient` → Orient on current block
- `orient day` → Orient on full day
- `orient week` → Orient on week

**Triggers:** User or AI Browser

---

### `carve [duration] [name]`
Claim time with intent. A signal to the system that this block is sacred.

**Scope:** block only

**Behavior:**
- Names a block with duration (default 60 min)
- Marks block type (deep/shallow/admin)
- Suggests name from tasks if not supplied
- System treats carved blocks as "protected by intent"
- Multi-hour blocks merge visually
- Can overwrite existing name
- Timestamp (internal, not visible)

**Examples:**
- `carve deep work` → 60-min block named "deep work"
- `carve 90min focus` → 90-min block named "focus"
- `carve 10am-12pm meetings` → 2-hour span named "meetings"

---

### `pivot`
Mid-day re-plan. Lock current plan, start fresh. Max 2x per day (3 plans total).

**Scope:** day only

**Behavior:**
- Lock current column (read-only)
- Gray/strikethrough/collapse locked column
- Create new column (Plan A → Plan B → Plan C)
- Auto-migrate incomplete tasks to new column
- Let user choose what migrates
- Timestamp (internal, not visible)
- Block if already pivoted twice
- Set focus to new column
- Set focus to current-time block

**Example:**
- `pivot` → Creates Plan B (or C), collapses old plan

---

### `shutdown`
Close the day. Migrate what's left. Once per day.

**Scope:** day only

**Behavior:**
- Block if already shut down
- Calculate completion rate (internal, not visible)
- Auto-migrate incomplete to tomorrow
- Let user choose what migrates
- Mark day as "closed" (no more edits)
- Collapse/hide the day view
- Prompt for reflection/notes
- Newport-style "shutdown complete" ritual
- Timestamp (internal, not visible)
- Reflect who triggered (user vs AI Browser automation)

**Example:**
- `shutdown` → Closes day, migrates tasks, prompts reflection

---

## Utility Verbs (Plumbing for AI Chaining)

These are REST-style verbs for programmatic access. Not user-facing.

### `get [scope]`
Read state (idempotent).

**Examples:**
- `get block` → Current block state
- `get day` → Full day state
- `get week` → Weekly state

---

### `post [scope] {data}`
Create new entities.

**Examples:**
- `post block {time: "10am", tasks: [...]}` → Create new block

---

### `patch [scope] {data}`
Update existing entities.

**Examples:**
- `patch block {taskId: "...", updates: {text: "new"}}` → Update task

---

### `delete [scope]`
Remove entities.

**Examples:**
- `delete block` → Remove current block

---

## Scopes

- **block** — Individual time slot (default for most verbs)
- **day** — Daily planning (block collection)
- **week** — Weekly role-based planning
- **quarter** — Quarterly goals (future)
- **year** — Annual vision (future)

---

## Command Examples

```
orient                    → Suggest next moves for current block
orient day                → Survey the day, suggest priorities
carve deep work           → Claim current block (60 min)
carve 90min focus         → Claim 90-min block
pivot                     → Lock plan, start Plan B
shutdown                  → Close day, migrate incomplete
get day                   → Query full day state
```

---

## Chaining (AI Browser)

AI Browser can execute multiple commands in sequence:

```javascript
executeChain([
  'get day',
  'orient',
  'patch block {taskId: "...", updates: {completed: true}}'
])
```

Results from previous commands are available as context for subsequent commands.

---

## Implementation Status

### Core Verbs
- [ ] orient (block, day, week)
- [ ] carve (block)
- [ ] pivot (day)
- [ ] shutdown (day)

### Utility Verbs
- [x] get (block, day)
- [ ] post (block)
- [ ] patch (block)
- [ ] delete (block)

### Scopes
- [x] block
- [x] day
- [ ] week
- [ ] quarter
- [ ] year

---

## Quick Start for AI Browser

1. Open `index.html` in browser
2. Press Ctrl+K to open command input
3. Type commands:
   - `orient` or `orient day`
   - `carve deep work` to claim time
   - `pivot` to re-plan mid-day
   - `shutdown` to close the day

4. Console access:
   - `executeCommand("orient day")`
   - `executeChain(["get day", "orient"])`

---

## Future Exploration

- OODA loop alignment (Observe → Orient → Decide → Act) — how does this command system map to Boyd's framework?
