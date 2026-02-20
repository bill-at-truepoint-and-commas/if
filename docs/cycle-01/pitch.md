# Cycle 01: Make It Work

## Problem
Current task editing is fundamentally broken (contentEditable hell). Can't reliably add tasks, cursor bugs, copy/paste issues. The app is unusable for its core purpose: planning time blocks.

## Appetite
**1 week (5 days)** - This is a small batch cycle to prove the foundation works.

## Solution (Breadboard)

### Places
- Daily time block cells (the 8 hourly rows)
- Command input (already exists at bottom)

### Elements per Block Cell
```
[Time Cell: Read-only]
  09:00am [deep work]

[Editable Cell]
  Edit Mode (on focus):
    [Textarea] - One line per task
      "- [ ] Write proposal"
      "- [x] Review docs"
      "- [ ] Send update"
  
  View Mode (default):
    [Rendered Task List]
      ☐ Write proposal
      ☑ Review docs
      ☐ Send update
```

### Connections
- Click cell → switch to edit mode (textarea appears)
- Type in textarea → auto-parse on blur (after 1 sec)
- Check checkbox in view mode → toggle completion, save
- Enter key in textarea → just adds newline (native behavior)
- Command API can read/write via `post block` and `patch block`

## Scope (Hill Chart)

### Uphill (Figuring out)
1. **Task data model** - How to store tasks with IDs, completion state
2. **Parse/render strategy** - When to convert between textarea ↔ rendered list

### Downhill (Executing)
3. **Input component** - Build the textarea/list switcher
4. **Command integration** - Make `post` and `patch` work with new model
5. **Storage adapter** - Update save/load to handle new format

## Rabbit Holes to Avoid
- ❌ Real-time parsing as you type (just parse on blur)
- ❌ Markdown validation (just strip `- [ ]` and `- [x]` prefixes)
- ❌ Drag-to-reorder tasks
- ❌ Undo/redo
- ❌ Complex keyboard shortcuts (arrow keys, etc.)
- ❌ Multi-line tasks (one line = one task, period)

## No-Gos (Out of Bounds)
- Weekly view (broken, ignore it this cycle)
- Quarterly goals (future cycle)
- AI harvesting (needs this foundation first)
- Styled task rendering (bold, links, etc.)
- Task dependencies or sub-tasks

## Success Criteria (Test Cases)
1. ✅ Can add 3 tasks to a block via textarea
2. ✅ Can check off task #2
3. ✅ Can edit task #1 text
4. ✅ Tasks persist after page reload
5. ✅ Can add task via command: `executeCommand("post block {tasks: ['new task']}")`
6. ✅ Cursor doesn't jump around when editing

## Circuit Breaker
**If by Day 3** task editing isn't feeling solid:
- **Simplify:** Drop textarea approach
- **Fallback:** One `<input type="text">` per task (simpler, less elegant)
- **Still counts as shipped:** A working, if basic, task editor

## Deliverables
- Working task editor (textarea or inputs)
- Updated `app.js` with new data model
- Commands `post` and `patch` functional
- Old contentEditable code removed
- Brief "what I learned" note in cycle docs

## Next Cycle Preview
Once this works, Cycle 02 will add:
- Multi-scale planning (goals → week → day)
- Alignment indicators
- Better commands for AI integration
