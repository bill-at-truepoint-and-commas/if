# Cycle 01: Project Context

## What We're Building
**Infinite Frontiers** - A personal time-blocking app that combines Cal Newport's multi-scale planning with AI Browser capabilities.

**User count:** 1 (just you)  
**Paradigm:** Local-first, no backend, no auth, experimental freedom

## Core Philosophy (Cal Newport)
1. **Intentionality over reaction** - Time-blocking moves from managing tasks to managing time
2. **Deep/Shallow dichotomy** - Not all work is equal; protect deep work time
3. **Multi-scale planning** - Quarterly goals → Weekly intentions → Daily blocks
4. **Pull-based system** - You decide what gets time, not your inbox
5. **Continuous replanning expected** - Plans break, that's normal

## Tech Stack
- **Frontend:** Vanilla JS (no framework yet, maybe React later)
- **Storage:** localStorage (export/import for backups)
- **AI Integration:** Commands → AI Browser executes
- **Styling:** Comic Neue font, hand-drawn aesthetic, minimal

## Current State (Gap Analysis Summary)

### What Works ✅
- Commands.md structure (verb + scope pattern)
- Router.js (natural language parsing)
- Style.css (aesthetic is good)
- Storage patterns (week-based keys)
- Basic table structure

### What's Broken ❌
- Task editing (contentEditable hell)
- Weekly/daily disconnected
- No AI integration beyond stubs
- No multi-scale planning data flow

### What's Missing 🚧
- Quarterly goals
- Harvest workflow
- Replan diff view
- Next-best-action suggestions
- Alignment dashboard

## Architecture Vision

```
┌─────────────────────────────────────────┐
│         Infinite Frontiers App                   │
│                                         │
│  ┌──────────┐  ┌──────────────────┐   │
│  │ UI Layer │←→│ Command Router   │   │
│  └──────────┘  └──────────────────┘   │
│                                         │
│  ┌──────────┐  ┌──────────────────┐   │
│  │ State    │←→│ Pattern Learning │   │
│  │(Storage) │  │ (simple → ML)    │   │
│  └──────────┘  └──────────────────┘   │
│                                         │
│  ┌──────────┐  ┌──────────────────┐   │
│  │ Config   │  │ Export/Import    │   │
│  │(.md tabs)│  │ (JSON, CSV)      │   │
│  └──────────┘  └──────────────────┘   │
└─────────────────────────────────────────┘
            ↕ AI Browser API
┌─────────────────────────────────────────┐
│    External Sources                     │
│  Gmail | Calendar | Notion | .md files │
└─────────────────────────────────────────┘
```

## Data Model (Evolving)

### Task
```javascript
{
  id: "uuid",           // unique identifier
  text: "Write proposal",
  completed: false,
  createdAt: timestamp,
  blockId: "09:00am",   // which time block
  goalId: null,         // future: link to quarterly goal
  estimatedMins: null,  // future: for capacity planning
  source: "manual"      // future: "gmail", "harvest", etc.
}
```

### Block
```javascript
{
  time: "09:00am",
  date: "2025-11-25",
  tasks: [task1, task2],
  blockName: "deep work",  // carved name
  type: "deep" | "shallow" | null,
  revised: false           // for pivot command
}
```

### Day State
```javascript
{
  day: "monday",
  week: "Nov18-22",
  blocks: [block1, block2, ...],
  completionRate: 0.65
}
```

## Commands API (Current)

### Verbs
- `expand [scope]` - Analyze and suggest actions
- `pivot` - Lock current plan, start Plan B
- `shutdown [scope]` - End-of-period review
- `carve [params]` - Name time blocks
- `get [scope]` - Read state (working)
- `patch [scope] {data}` - Update (stub)
- `post [scope] {data}` - Create (stub)
- `delete [scope]` - Remove (stub)

### Scopes
- `block` - Individual time slot
- `day` - Daily planning (default)
- `week` - Weekly roles
- `quarter` - Quarterly goals (future)
- `year` - Annual vision (future)

### Usage Examples
```javascript
executeCommand("expand")
executeCommand("pivot")
executeCommand("carve deep work")
executeCommand("get day")
```

## File Structure
```
if/
├── index.html          # Daily view
├── commands.md         # API reference for AI
├── docs/
│   ├── cycle-01/       # This cycle's docs
│   │   ├── pitch.md
│   │   ├── context.md
│   │   └── reference.md
│   └── cycle-02/       # Future
├── src/
│   ├── style.css       # Keep this
│   ├── app.js          # Rebuild this cycle
│   ├── router.js       # Keep this
│   ├── week.js         # Ignore this cycle
│   └── weekly.html     # Ignore this cycle
└── archive/            # Old broken code
```

## Session Usage Pattern

At the start of each session:
1. Load this context.md
2. Load current cycle's pitch.md
3. Load reference.md (code snippets, decisions)
4. Remind Claude: "We're in Cycle 01, Day X"

This way Claude has:
- The big picture (context.md)
- The current focus (pitch.md)
- Technical details (reference.md)
- Your session state

## Shape Up Principles Applied
- **Appetite-driven:** 1 week max this cycle
- **Bounded scope:** Just task editing, nothing else
- **Circuit breaker:** Fallback to simpler solution by Day 3
- **Hill chart:** Track what's uphill vs downhill
- **Cool-down after:** Use the tool, find bugs, shape next cycle
