# Quick Start: Session Setup

## Before Each Session

### 1. Copy this prompt:
```
I'm working on Infinite Frontiers (time-blocking app). 
We're in Cycle 01, Day [X].

I've uploaded:
- context.md (project overview)
- pitch.md (this cycle's scope)
- reference.md (technical details)

Let's continue where we left off.
```

### 2. Upload these files to Claude:
- [ ] `docs/cycle-01/context.md`
- [ ] `docs/cycle-01/pitch.md`
- [ ] `docs/cycle-01/reference.md`
- [ ] `docs/cycle-01/session-log.md` (if you have notes from last session)

### 3. Tell Claude what you want to work on
Example: "Today I want to implement the textarea parsing logic"

---

## That's It!

Claude now has:
✅ What Infinite Frontiers is  
✅ What we're building this cycle  
✅ Technical patterns to follow  
✅ What happened last session  

You can jump straight into coding without re-explaining the project.

---

## Quick Reference

**Project:** Infinite Frontiers (Newport's time-blocking + AI Browser)  
**Current Cycle:** 01 - "Make It Work"  
**Appetite:** 1 week  
**Focus:** Fix task editing (textarea + parse/render)  
**Circuit Breaker:** Day 3 - switch to simple inputs if stuck  

**Files to Modify:**
- `src/app.js` (main work)
- `index.html` (minor changes)

**Files to Keep:**
- `src/style.css`
- `src/router.js`
- `commands.md`

**Files to Ignore:**
- `src/week.js`
- `src/weekly.html`

---

## End of Session Checklist

- [ ] Update `session-log.md` with what you did
- [ ] Mark hill chart progress
- [ ] Note any blockers for next time
- [ ] Commit changes to git (optional but recommended)

---

## Tips

**If Claude seems confused:**
"Please re-read the context.md - we're focused on task editing this cycle only"

**If scope is creeping:**
"That's interesting but out of scope for Cycle 01. Let's add it to ideas for Cycle 02"

**If you're stuck:**
"We're on Day 3 and this isn't working. Should we trigger the circuit breaker?"

**If you want to reshape:**
"I want to revise the pitch for this cycle. Let's update pitch.md together"
