# Infinite Frontiers - Time Blocking App

Personal time-blocking app combining Cal Newport's multi-scale planning with AI Browser capabilities.

## Quick Start

1. Open `index.html` in browser
2. Press `Ctrl+K` to enter commands
3. Try: `expand`, `pivot`, `carve deep work`, `shutdown`

## Project Structure

```
if/
├── index.html              # Main app entry point
├── commands.md             # API reference for AI Browser
├── docs/                   # Cycle documentation (Shape Up)
│   ├── README.md           # How the doc system works
│   └── cycle-01/           # Current development cycle
│       ├── QUICK-START.md  # Session checklist
│       ├── pitch.md        # What we're building this cycle
│       ├── context.md      # Project overview
│       └── reference.md    # Technical details
├── src/                    # Source code (modular)
│   ├── app.js              # Core logic (rebuilding in Cycle 01)
│   ├── router.js           # Command parser (working)
│   ├── style.css           # Styling (keep)
│   ├── storage.js          # localStorage operations
│   ├── dom-helpers.js      # DOM manipulation utilities
│   ├── utilities.js        # General helpers
│   ├── state-queries.js    # State getters
│   ├── initialization.js   # Setup routines
│   └── namespaces.js       # Multi-scale namespaces
└── archive/                # Old code (reference only)
```

## Active Development

**Current Cycle:** 01 - "Make It Work"  
**Focus:** Fix task editing (contentEditable → textarea + parse/render)  
**Appetite:** 1 week  
**Status:** Ready to start

See `docs/cycle-01/QUICK-START.md` for development workflow.

## Tech Stack

- **Frontend:** Vanilla JavaScript (modular)
- **Storage:** localStorage
- **Commands:** Natural language (verb + scope)
- **Styling:** Comic Neue font, minimal aesthetic

## Commands API

```javascript
// Verbs
expand [scope]      // Analyze and suggest
pivot               // Start Plan B
shutdown [scope]    // End-of-period review
carve [params]      // Name time blocks
get [scope]         // Read state
patch [scope]       // Update
post [scope]        // Create
delete [scope]      // Remove

// Scopes
block, day, week, quarter, year

// Usage
executeCommand("expand")
executeCommand("carve deep work")
executeCommand("get day")
```

## For AI Browsers

The command system is designed for AI Browser automation:
1. Load `commands.md` for API reference
2. Use `executeCommand(...)` to interact
3. Chain commands: `executeChain(['get day', 'expand'])`

## Learning Approach

This project uses **Shape Up methodology**:
- Fixed time budgets (appetites)
- Bounded scope per cycle
- Circuit breakers for rabbit holes
- Cool-down periods between cycles

See `docs/README.md` for the full development system.

## Current Status

✅ Commands API structure  
✅ Router working  
✅ Storage pattern established  
⚠️ Task editing broken (Cycle 01 focus)  
⏳ Multi-scale planning (future)  
⏳ AI harvesting (future)  

## Next Steps

1. Read `docs/cycle-01/QUICK-START.md`
2. Start development session
3. Fix task editing
4. Ship working time-blocker
