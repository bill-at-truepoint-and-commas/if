# Archive

This directory contains old code and experiments that aren't part of the active codebase but are preserved for reference.

## Structure

### experiments/
One-off scripts and experiments:
- `carve-fix.js` - Experiment with carve command
- `carve-new.js` - Alternative carve implementation

### old-code/
Legacy implementations and broken features:
- `app-bundled.js` - Old bundled version
- `app-modular.js` - Old modular attempt
- `app-simple.js` - Simplified version attempt
- `commands.js` - Duplicate/unused commands
- `test.js`, `simple-test.js` - Old test files
- `week.js` - Broken weekly view implementation
- `weekly.html` - Broken weekly UI

### old-html/
Previous HTML versions:
- `tb_daily.html` - Old daily view
- `tb_weekly.html` - Old weekly view
- `revision-decision.png` - Design decision artifact

## Why These Were Archived

**Broken/Legacy:**
- Weekly view implementation (`week.js`, `weekly.html`) has broken task editing
- Old app.js iterations were attempts at modularization that didn't work out
- Test files weren't maintained

**Superseded:**
- Newer modular structure in active `src/` directory
- Command system now in `router.js` and `commands.md`

## If You Need Something

All this code still exists if you need to:
- Reference old approaches
- Extract useful patterns
- Remember why something was done a certain way

Just don't import from here - it's intentionally disconnected from the active codebase.
