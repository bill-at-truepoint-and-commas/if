# Infinite Frontiers - Cycle Documentation System

## Overview
This directory contains structured documentation for each development cycle, designed to make Claude conversations efficient and contextual.

## Why This System?
Long Claude conversations can lose context. Instead of re-explaining the project every session, we load 2-4 markdown files that give Claude everything it needs:
- The big picture (what are we building?)
- The current focus (what's the appetite for this cycle?)
- Technical details (code patterns, decisions)
- Session continuity (what happened last time?)

## File Structure

```
docs/
├── README.md              ← This file
├── cycle-01/              ← Current cycle
│   ├── pitch.md           ← The shaped work (problem, appetite, scope)
│   ├── context.md         ← Project overview, philosophy, architecture
│   ├── reference.md       ← Technical details, code patterns
│   └── session-log.md     ← Running log of each work session
├── cycle-02/              ← Future cycle
│   └── ...
└── archive/               ← Completed cycles
    └── cycle-01/
```

## How to Use

### Starting a New Session
1. Open Claude
2. Upload these files:
   - `docs/cycle-01/context.md`
   - `docs/cycle-01/pitch.md`
   - `docs/cycle-01/reference.md`
3. Say: "We're in Cycle 01, Day X. Let's continue where we left off."

Claude now knows:
- What Infinite Frontiers is
- What we're building this cycle
- Technical constraints and patterns
- Where we are in the hill chart

### During a Session
- Keep `session-log.md` open
- Update it as you make decisions
- At end of session, save your notes
- These notes become context for next session

### Between Cycles (Cool-down)
- Use the tool daily, find rough edges
- Document learnings in cycle folder
- Shape next cycle (create `cycle-02/pitch.md`)
- Archive completed cycle

## File Descriptions

### `pitch.md` (Shape Up Pitch)
Contains:
- **Problem:** What's broken/missing?
- **Appetite:** How long are we betting?
- **Solution:** Breadboarded approach
- **Scope:** Hill chart (uphill vs downhill)
- **Rabbit holes:** What to avoid
- **No-gos:** What's explicitly out of bounds
- **Success criteria:** Test cases
- **Circuit breaker:** Fallback if stuck

**When to update:** Only when reshaping mid-cycle (rare)

### `context.md` (Project Context)
Contains:
- Project vision (Infinite Frontiers = Newport + AI Browser)
- Core philosophy (Cal Newport principles)
- Tech stack decisions
- Data models
- Commands API
- File structure

**When to update:** 
- When architecture changes
- When data models evolve
- When adding new scopes/commands

### `reference.md` (Technical Details)
Contains:
- Code locations (what to modify, what to keep)
- Storage patterns
- Implementation options (with pros/cons)
- Helper functions needed
- Testing checklist
- Known issues

**When to update:**
- When you make implementation decisions
- When you discover better patterns
- When adding new helper functions

### `session-log.md` (Running Log)
Contains:
- Date, duration
- What you worked on
- Decisions made
- Blockers
- Next steps
- Hill chart status

**When to update:** Every session, end of day

## Shape Up Principles

### Appetite-Driven
- Cycle 01: 1 week (small batch)
- Cycle 02: 2 weeks (medium batch)
- Never exceed appetite - cut scope instead

### Bounded Scope
Each pitch clearly defines:
- What's IN (the hill chart)
- What's OUT (no-gos)
- Circuit breaker (fallback plan)

### Hill Chart Tracking
**Uphill = figuring out** (unknowns, design, exploration)
**Downhill = executing** (implementing, testing, polishing)

Track in session log:
```
Task data model: ████░░░░ (50% uphill)
Input component: ░░░░░░░░ (not started)
Command integration: ████████ (100% downhill, shipping)
```

## Tips for Effective Sessions

### Do:
✅ Load context docs at start of EVERY session  
✅ Update session log as you go  
✅ Capture decisions in reference.md  
✅ Respect the appetite (time-box)  
✅ Use circuit breaker if stuck  

### Don't:
❌ Try to remember project details from memory  
❌ Let scope creep ("just one more feature...")  
❌ Work past the appetite without reshaping  
❌ Skip session logs (you'll forget decisions)  
❌ Fight rabbit holes (use circuit breaker)  

## Example Session Flow

**You:**
> "Starting Day 2 of Cycle 01. Yesterday I got the task data model working. Today I want to tackle the textarea component."

**Claude (after reading docs):**
> "Great! I see from reference.md we're doing Option A (textarea with parse/render). Let's implement the mode switching first..."

[Work happens]

**End of session:**
1. Update `session-log.md` with decisions
2. Mark "Input component" progress on hill chart
3. Note any blockers for next session

**Next session:**
1. Load context docs again
2. Read your session log from last time
3. Continue from where you left off

## Cycle Transitions

### End of Cycle
1. Test against success criteria (pitch.md)
2. Write brief retrospective / session log in cycle folder
3. **Merge `claude/...` → `main` via PR on GitHub** (human reviews and merges)
4. Claude starts next cycle's branch fresh from `main`
5. Move cycle to `archive/`
6. Use tool in cool-down period (1 week)

### Shape Next Cycle
1. Create `cycle-XX/` folder
2. Write new `pitch.md` based on learnings
3. Update `context.md` if architecture changed
4. Start fresh `reference.md` for new scope

## Git Workflow

### Branching Convention
- Claude works on `claude/[description]-[session-id]`
- Human commits go directly to `main`
- At the **end of each cycle**, human merges Claude's branch → `main` via GitHub PR

### Session Start Checklist (Claude)
1. `git log --oneline -10` — see recent history
2. `git status` — check for uncommitted changes
3. `git fetch origin` — check for remote changes
4. Merge `origin/main` if it has new commits before starting work

## Questions?

This system is experimental. Adjust as needed:
- Too much documentation? Merge files
- Too little? Split reference.md by topic
- Wrong structure? Reshape it

The goal: **Maximum context, minimum friction** for both you and Claude.
