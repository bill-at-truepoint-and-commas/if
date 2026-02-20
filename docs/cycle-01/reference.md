# Cycle 01: Technical Reference

## Current Code Locations

### Files to Modify This Cycle
- `src/app.js` - Core logic (task model, editing, commands)
- `index.html` - Daily view structure (minor changes)

### Files to Keep As-Is
- `src/style.css` - Don't touch styling yet
- `src/router.js` - Command parsing works
- `commands.md` - API reference (update if commands change)

### Files to Ignore
- `src/week.js` - Broken, future cycle
- `src/weekly.html` - Broken, future cycle
- `tb_daily.html` - Legacy
- `tb_weekly.html` - Legacy

## Storage Pattern (Keep This)

### Current Key Structure
```javascript
// Daily data
`dayplanner_monday_weekof_Nov18-22`

// Helper functions (working, don't change)
function getStorageKey(date) {
  const dayName = getDayOfWeek(date);
  const week = getCurrentWeek();
  return `dayplanner_${dayName}_weekof_${week}`;
}
```

### Data Format (Currently)
```javascript
[
  {
    time: "09:00am",
    cells: [
      {
        col: "1",
        content: [
          {text: "Write proposal", completed: false},
          {text: "Review docs", completed: true}
        ]
      }
    ]
  }
]
```

### New Format (Target)
```javascript
{
  date: "2025-11-25",
  day: "monday",
  week: "Nov18-22",
  blocks: [
    {
      time: "09:00am",
      blockName: null,
      tasks: [
        {
          id: "uuid-1",
          text: "Write proposal",
          completed: false,
          createdAt: 1732550400000
        }
      ]
    }
  ]
}
```

## Task Editing Approaches

### Option A: Textarea with Parse/Render Toggle
**Pros:**
- Feels like editing a text file (familiar)
- Copy/paste just works
- Simple mental model

**Cons:**
- Need to switch between edit/view mode
- Parsing can be finicky

**Implementation:**
```javascript
// Edit mode (textarea visible)
<textarea class="block-editor">
- [ ] Write proposal
- [x] Review docs
- [ ] Send update
</textarea>

// View mode (rendered list)
<ul class="task-list">
  <li><input type="checkbox"> Write proposal</li>
  <li><input type="checkbox" checked> Review docs</li>
  <li><input type="checkbox"> Send update</li>
</ul>
```

### Option B: Individual Input Fields
**Pros:**
- No parsing needed
- Checkboxes always visible
- Each task is atomic

**Cons:**
- Less flexible for bulk editing
- More DOM nodes

**Implementation:**
```javascript
<div class="task-item">
  <input type="checkbox">
  <input type="text" value="Write proposal">
</div>
```

### Recommendation: Start with Option A
- More aligned with "text file" philosophy
- Better for AI Browser (can read/write as markdown)
- Can always fall back to Option B if parsing is painful

## Parsing Logic (Pseudocode)

```javascript
function parseTasksFromText(text) {
  const lines = text.split('\n');
  const tasks = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Match: "- [ ] Task text" or "- [x] Task text"
    const match = trimmed.match(/^-\s*\[([ x])\]\s*(.+)$/);
    
    if (match) {
      tasks.push({
        id: generateId(),
        text: match[2],
        completed: match[1] === 'x',
        createdAt: Date.now()
      });
    } else {
      // No checkbox syntax, treat as uncompleted task
      tasks.push({
        id: generateId(),
        text: trimmed,
        completed: false,
        createdAt: Date.now()
      });
    }
  }
  
  return tasks;
}

function renderTasksToText(tasks) {
  return tasks.map(t => 
    `- [${t.completed ? 'x' : ' '}] ${t.text}`
  ).join('\n');
}
```

## Command Integration

### Current Stubs (Need Implementation)
```javascript
// In app.js
patch: (data) => ({ status: 'pending', data }),
post: (data) => ({ status: 'pending', data }),
delete: () => ({ status: 'pending' })
```

### Target Implementation
```javascript
function postBlock(params) {
  // params format: {time: "09:00am", tasks: ["task 1", "task 2"]}
  // or: {tasks: [...]} for current block
  
  const time = params.time || getCurrentTimeSlot();
  const block = getOrCreateBlock(time);
  
  const newTasks = params.tasks.map(text => ({
    id: generateId(),
    text: typeof text === 'string' ? text : text.text,
    completed: false,
    createdAt: Date.now()
  }));
  
  block.tasks.push(...newTasks);
  saveData();
  
  return {
    success: true,
    time,
    added: newTasks.length
  };
}

function patchBlock(params) {
  // params format: {time: "09:00am", taskId: "uuid", updates: {text: "new text"}}
  // or: {taskId: "uuid", updates: {...}} for current block
  
  const time = params.time || getCurrentTimeSlot();
  const block = getBlock(time);
  
  if (!block) return {success: false, error: "Block not found"};
  
  const task = block.tasks.find(t => t.id === params.taskId);
  if (!task) return {success: false, error: "Task not found"};
  
  Object.assign(task, params.updates);
  saveData();
  
  return {
    success: true,
    task
  };
}
```

## UI State Management

### Current Approach (Broken)
```javascript
// Direct DOM manipulation, no state
textSpan.contentEditable = 'true';
textSpan.addEventListener('input', saveData);
```

### Better Approach (This Cycle)
```javascript
// Keep state in memory, render from state
const state = {
  blocks: {}  // keyed by time: "09:00am"
};

function renderBlock(time) {
  const block = state.blocks[time];
  const cell = document.querySelector(`[data-time="${time}"]`);
  
  if (cell.dataset.mode === 'edit') {
    renderTextarea(cell, block.tasks);
  } else {
    renderTaskList(cell, block.tasks);
  }
}

function switchMode(time, mode) {
  const cell = document.querySelector(`[data-time="${time}"]`);
  cell.dataset.mode = mode;
  renderBlock(time);
}
```

## Helper Functions Needed

```javascript
// ID generation
function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Block management
function getBlock(time) {
  return state.blocks[time] || null;
}

function getOrCreateBlock(time) {
  if (!state.blocks[time]) {
    state.blocks[time] = {
      time,
      tasks: [],
      blockName: null
    };
  }
  return state.blocks[time];
}

// Current time
function getCurrentTimeSlot() {
  const now = new Date();
  const hour = now.getHours();
  const slots = ['09:00am', '10:00am', '11:00am', '12:00pm', 
                 '01:00pm', '02:00pm', '03:00pm', '04:00pm'];
  if (hour < 9) return slots[0];
  if (hour >= 16) return slots[7];
  return slots[hour - 9];
}
```

## Testing Checklist

### Manual Tests
- [ ] Can click cell to enter edit mode
- [ ] Can type multiple tasks in textarea
- [ ] Can blur to switch to view mode
- [ ] Tasks render as checkboxes + text
- [ ] Can check a checkbox to complete
- [ ] Can uncheck to uncomplete
- [ ] Can click cell again to re-edit
- [ ] Tasks persist after reload
- [ ] Can add task with command: `executeCommand("post block {tasks: ['new']}")`
- [ ] Can edit task with command: `executeCommand("patch block {taskId: '...', updates: {text: 'updated'}}")`

### Edge Cases
- [ ] Empty block (no tasks)
- [ ] Block with one task
- [ ] Block with 10+ tasks
- [ ] Task with no text (should be filtered out)
- [ ] Task with special characters ("Buy milk & eggs")
- [ ] Page reload mid-edit (should save on blur first)

## Known Issues to Fix
1. Current code has multiple `saveData()` functions in different scopes
2. No proper state management (direct DOM manipulation)
3. Task IDs don't exist (can't reference specific tasks)
4. ContentEditable leftovers need complete removal
5. No debouncing on saves (could be spammy)

## Success Metrics
- Time to add 3 tasks: <10 seconds
- No cursor jumping
- No lost data on reload
- Commands work via console
- Code is <300 lines simpler than current app.js

## Next Session Template
```markdown
# Session: Cycle 01, Day X

## What I'm working on today
[Your focus for this session]

## Decisions made
- [Key decisions]

## Blockers
- [Anything stuck]

## For next session
- [What to pick up next]
```
