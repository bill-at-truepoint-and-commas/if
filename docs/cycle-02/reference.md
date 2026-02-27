# Cycle 02: Technical Reference

## File Structure (Current)

```
if/
├── index.html              # Daily view + week panel + orient panel
├── commands.md             # API reference for AI Browser
├── src/
│   ├── style.css           # Untouched
│   ├── app.js              # All logic (single IIFE, no modules)
│   └── router.js           # Command parser + UI input
└── docs/
    ├── cycle-01/
    └── cycle-02/           # This cycle
        ├── pitch.md
        └── reference.md
```

**Deleted this cycle:** `dom-helpers.js`, `storage.js`, `state-queries.js`,
`utilities.js`, `namespaces.js`, `initialization.js` (dead code, never loaded)

---

## Storage Keys

```javascript
// Daily plan
`dayplanner_monday_weekof_Feb17-21`

// Weekly intentions
`if_intentions_Feb17-21`

// Pivot snapshots (one per pivot, auto-keyed)
`dayplanner_monday_weekof_Feb17-21_pivot_1708435200000`
```

---

## Data Models

### Weekly Intentions
```javascript
// Simple array of strings
["finish project proposal", "clear email backlog", "exercise 3x"]
```

### Daily Data (unchanged from Cycle 01)
```javascript
{
  blocks: [
    {
      time: "09:00am",
      blockName: "deep work",   // null if not carved
      tasks: [
        {
          id: "task_1708435200000_abc123",
          text: "Write proposal",
          completed: false,
          createdAt: 1708435200000,
          pivotedFrom: "10:00am",   // optional: set by pivot
          rolledFrom: "monday-11:00am"  // optional: set by shutdown rollover
        }
      ]
    }
  ]
}
```

---

## Public API (`window.inf`)

### Day-level (default scope)

```javascript
inf.orient()            // → orientBlock() — current block context
inf.orient('day')       // → orientDay() — weekly intentions + day state
inf.orient('week')      // → orientWeek() — opens week panel
inf.getDayState()       // → full day state object
inf.getCurrentTimeBlock() // → current block object
inf.pivot()             // → resets day, moves incomplete → 09:00am
inf.shutdown()          // → rolls incomplete → tomorrow's 09:00am
inf.carve('deep work')  // → names current block
inf.carve('10am-12pm focus') // → names multi-hour range
```

### Block namespace

```javascript
inf.block.orient()           // same as inf.orient()
inf.block.getState()         // current time block state
inf.block.post({tasks: []})  // add tasks to current/specified block
inf.block.patch({taskId, updates}) // update a task
inf.block.carve('name')      // carve current block
```

### Week namespace

```javascript
inf.week.orient()            // opens week panel
inf.week.getState()          // { week, intentions }
inf.week.getIntentions()     // → ["intention 1", ...]
inf.week.setIntentions(arr)  // programmatically set intentions
```

### Command strings (via router)

```javascript
executeCommand("orient")
executeCommand("orient day")
executeCommand("orient week")
executeCommand("carve deep work")
executeCommand("carve 10am-12pm meetings")
executeCommand("pivot")
executeCommand("shutdown")
executeCommand("get day")
executeCommand("post block {\"tasks\": [\"new task\"]}")
executeCommand("patch block {\"taskId\": \"task_...\", \"updates\": {\"completed\": true}}")
```

---

## orient() Return Values

### `orient('block')`
```javascript
{
  scope: 'block',
  time: '10:00am',
  tasks: [...],
  incomplete: 2,
  complete: 1,
  suggestion: 'Keep going: Write proposal (1/3 done)'
}
```

### `orient('day')`
```javascript
{
  scope: 'day',
  day: 'monday',
  week: 'Feb17-21',
  weekIntentions: ['finish proposal', 'clear email'],
  totalTasks: 8,
  completedTasks: 3,
  completionRate: 37,     // percentage
  emptyBlocks: 4,
  suggestedFocus: 'finish proposal'
}
```

### `orient('week')`
```javascript
{
  scope: 'week',
  week: 'Feb17-21',
  intentions: ['finish proposal', 'clear email'],
  count: 2
}
// Also opens the week panel UI
```

---

## pivot() Behavior

**New (Cycle 02):**
1. Collects all incomplete tasks from all blocks
2. Saves snapshot to `[storageKey]_pivot_[timestamp]`
3. Resets `state.blocks = {}`
4. Puts all incomplete tasks in `09:00am` block with `pivotedFrom` metadata
5. Re-renders all blocks

**Not implemented:** multi-column Plan A/B/C (future cycle)

---

## shutdown() Behavior

1. Finds all incomplete tasks across all blocks
2. Loads/creates tomorrow's daily data from localStorage
3. Appends incomplete tasks to tomorrow's `09:00am` block with `rolledFrom` metadata
4. Shows summary in orient panel
5. Does **not** lock the current day (could add in future)

---

## Week Panel

**Opens via:** `inf.orient('week')`, `executeCommand("orient week")`, or "week" button
**Closes via:** "done" button (saves on close)
**Auto-saves:** on textarea blur

---

## orient Panel

**Opens via:** any `orient*`, `pivot`, or `shutdown` call
**Closes via:** "×" button or `inf._closeOrientPanel()` (internal)

---

## AI Browser Chaining Examples

```javascript
// Morning orientation
executeChain([
  'orient day'
])

// Add tasks to current block then orient
executeChain([
  'post block {"tasks": ["Review PR", "Write tests"]}',
  'orient block'
])

// Set weekly intentions programmatically
inf.week.setIntentions([
  'Ship login feature',
  'Clear review queue',
  'Prep for Monday standup'
])
```

---

## Known Limitations (Cycle 02)

- `orient day` suggestion logic is simple (first-keyword matching) — no semantic similarity
- `pivot` does not show a "previous plan" view — just snapshots to localStorage
- `shutdown` does not lock the day — user can still edit after shutting down
- `carve` time range normalization only handles `Xam/Xpm` format, not `X:00am`
- Week panel is always for the current week (no navigation to past/future weeks)

## Next Cycle Preview (Cycle 03)

- Quarterly goals (one level above weekly)
- Alignment indicator: visual signal when daily blocks drift from weekly intentions
- Shutdown ritual with week-in-review prompt
- `orient day` semantic matching (does block content relate to intentions?)
