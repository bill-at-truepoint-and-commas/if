# Cycle 01: "Make It Work" — Session Log

## What We Built
Replaced the broken contentEditable task editing with a textarea parse/render toggle. The app now has a working task editor.

## Key Decisions

### Data Model
- **Task shape:** `{id, text, completed, createdAt}` — minimal, no future fields
- **ID generation:** `'task_' + Date.now() + '_' + random` — good enough for single-user localStorage
- **State is memory-first:** `state.blocks` object keyed by time string. DOM is always rendered from state, never the other way around. This was the biggest architectural shift — the old code scraped the DOM to build save data.

### Parse/Render Strategy
- **Edit mode:** Click cell → textarea appears with `- [ ] task` / `- [x] task` markdown format
- **View mode:** Blur textarea → parse text into task objects, render as checkbox list
- **Parse on blur only** — no real-time parsing, no debounce complexity
- **ID preservation:** On parse, match by text content against existing tasks to reuse IDs. Pragmatic heuristic — fails on duplicate task text, acceptable tradeoff for this cycle
- **Placeholder:** `...` — neutral, won't confuse an AI Browser into thinking it's real content

### Storage
- **New format:** `{blocks: [{time, blockName, tasks: [...]}]}` — flat, clean
- **Old format migration:** Detect bare array (old format) on load, convert automatically. Handles the latent `data-col: undefined` bug in old saved data by flattening all cells' content
- **Saves structured data, not markdown** — the `- [ ]` syntax only exists transiently in the textarea

### What We Kept
- `router.js` — untouched, commands dispatch correctly
- `style.css` — untouched, existing `.task-list` / `.task-checkbox` / `.task-text` classes reused
- `index.html` — untouched, `block-cell` elements work as containers
- Textarea CSS injected via JS in `init()` to honor the "don't touch style.css" rule

### What We Removed
- `createTaskItem()` — no more contentEditable spans
- All `contentEditable = 'true'` references
- DOM-scraping in `saveData()`, `getCellContent()`, `getDayState()`, `getCurrentTimeBlock()`
- Enter-key-new-task and blur-cleanup event listeners from `initializeCells()`

## Scope Check
- `editable-cell` vs `block-cell` mismatch in modular helper files (`storage.js`, `dom-helpers.js`) — those files are dead code, not loaded. Left for future cleanup.
- `pivot()` still references `data-col` columns that don't exist in the HTML — will silently fail. Out of scope this cycle.
- Modularizing `app.js` into separate files — future cycle concern.

## Deliverables

| Deliverable | Status |
|-------------|--------|
| Working task editor (textarea) | Done |
| Updated `app.js` with new data model | Done |
| Commands `post` and `patch` functional | Done |
| Old contentEditable code removed | Done |
| "What I learned" note | This doc |

## What I Learned

1. **State-first beats DOM-first.** The old code read task data from the DOM (scraping `textContent` from spans). That meant the DOM was the source of truth, which made everything fragile — contentEditable quirks, cursor jumping, phantom elements. Keeping an in-memory `state.blocks` and rendering from it made the whole system predictable.

2. **The placeholder matters for AI.** A placeholder like `- [ ] new task` looks like real content to an AI Browser. It could try to edit it, or see it appear and disappear between edit/view mode and think something broke. `...` is inert — both humans and AI skip over it.

3. **Parse on blur is the right call.** No real-time parsing means no flickering, no partial parse states, no edge cases with half-typed markdown syntax. The user types freely, and we sort it out once when they leave.

4. **Migration adapters are cheap insurance.** The `migrateOldData()` function is 20 lines and handles the format change transparently. Worth it to avoid "clear your localStorage" instructions.

5. **ID preservation by text matching is a pragmatic hack.** It works for 95% of cases (unique task text). The 5% failure (duplicate task names) is acceptable for a personal tool. A more robust approach would encode IDs in the textarea, but that leaks implementation details to the user.

## For Cycle 02
- Multi-scale planning (goals → week → day)
- Alignment indicators
- Better commands for AI integration
- Consider: modularizing `app.js` now that the architecture is stable
- Consider: cleaning up dead helper files (`storage.js`, `dom-helpers.js`, etc.)
