// Infinite Frontiers — Cycle 02b: multi-plan pivot
// Public API: window.inf

(function () {
    'use strict';

    // ========================================
    // STATE
    // ========================================

    const state = {
        selectedDay: new Date(),
        currentWeek: null,
        // Each plan: { id, label, locked, lockedAt, blocks: { "09:00am": { time, blockName, tasks[] } } }
        plans: [
            { id: 'a', label: 'Plan A', locked: false, lockedAt: null, blocks: {} }
        ],
        activePlanIndex: 0
    };

    const TIME_SLOTS = ['09:00am', '10:00am', '11:00am', '12:00pm',
                        '01:00pm', '02:00pm', '03:00pm', '04:00pm'];

    const PLAN_IDS    = ['a', 'b', 'c'];
    const PLAN_LABELS = ['Plan A', 'Plan B', 'Plan C'];

    // ========================================
    // UTILITIES
    // ========================================

    function generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function getCurrentWeek() {
        const today    = new Date();
        const dow      = today.getDay();
        const monday   = new Date(today);
        monday.setDate(today.getDate() + (dow === 0 ? -6 : 1 - dow));
        const friday   = new Date(monday);
        friday.setDate(monday.getDate() + 4);
        const months   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${months[monday.getMonth()]}${monday.getDate()}-${friday.getDate()}`;
    }

    function getDayOfWeek(date) {
        return ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][date.getDay()];
    }

    function getStorageKey(date) {
        return `dayplanner_${getDayOfWeek(date)}_weekof_${getCurrentWeek()}`;
    }

    function getCurrentTimeSlot() {
        const h = new Date().getHours();
        if (h < 9)  return TIME_SLOTS[0];
        if (h >= 16) return TIME_SLOTS[TIME_SLOTS.length - 1];
        return TIME_SLOTS[h - 9];
    }

    function getDaysOfWeek() {
        const today  = new Date();
        const dow    = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() + (dow === 0 ? -6 : 1 - dow));
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            return d;
        });
    }

    // ========================================
    // PLAN ACCESSORS
    // ========================================

    function activePlan() {
        return state.plans[state.activePlanIndex];
    }

    function getBlock(time, planIndex) {
        const plan = state.plans[planIndex !== undefined ? planIndex : state.activePlanIndex];
        return plan ? (plan.blocks[time] || null) : null;
    }

    function getOrCreateBlock(time, planIndex) {
        const plan = state.plans[planIndex !== undefined ? planIndex : state.activePlanIndex];
        if (!plan.blocks[time]) {
            plan.blocks[time] = { time, tasks: [], blockName: null };
        }
        return plan.blocks[time];
    }

    // ========================================
    // PARSE / RENDER  (textarea <-> task objects)
    // ========================================

    function parseTasksFromText(text, time, planIndex) {
        const existing = getBlock(time, planIndex);
        const existingTasks = existing ? existing.tasks : [];
        return text.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0)
            .map(line => {
                const match = line.match(/^-\s*\[([ xX])\]\s*(.+)$/);
                if (match) {
                    const taskText  = match[2].trim();
                    const completed = match[1].toLowerCase() === 'x';
                    const found     = existingTasks.find(t => t.text === taskText);
                    return {
                        id: found ? found.id : generateId(),
                        text: taskText, completed,
                        createdAt: found ? found.createdAt : Date.now()
                    };
                }
                const found = existingTasks.find(t => t.text === line);
                return {
                    id: found ? found.id : generateId(),
                    text: line, completed: false,
                    createdAt: found ? found.createdAt : Date.now()
                };
            });
    }

    function renderTasksToText(tasks) {
        return tasks.map(t => `- [${t.completed ? 'x' : ' '}] ${t.text}`).join('\n');
    }

    // ========================================
    // DOM HELPERS
    // ========================================

    function getTableRows() {
        return document.querySelectorAll('#daily-table tbody tr');
    }

    function findRowByTime(time) {
        for (const row of getTableRows()) {
            if (row.dataset.time === time) return row;
        }
        return null;
    }

    function getCell(time, planId) {
        return document.querySelector(`.block-cell[data-time="${time}"][data-plan="${planId}"]`);
    }

    // ========================================
    // BLOCK RENDERING
    // ========================================

    function renderBlock(time, planIndex) {
        if (planIndex === undefined) planIndex = state.activePlanIndex;
        const plan = state.plans[planIndex];
        if (!plan) return;

        const cell = getCell(time, plan.id);
        if (!cell) return;

        const block  = plan.blocks[time];
        const tasks  = block ? block.tasks : [];
        const locked = plan.locked;

        cell.innerHTML = '';

        // Edit mode (only for unlocked active plan)
        if (!locked && cell.dataset.mode === 'edit') {
            const textarea = document.createElement('textarea');
            textarea.className = 'block-editor';
            textarea.value    = tasks.length > 0 ? renderTasksToText(tasks) : '';
            textarea.placeholder = '...';
            textarea.rows     = Math.max(tasks.length + 1, 3);

            textarea.addEventListener('blur', function () {
                cell.dataset.mode = 'view';
                getOrCreateBlock(time, planIndex).tasks = parseTasksFromText(this.value, time, planIndex);
                saveData();
                renderBlock(time, planIndex);
            });
            textarea.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') this.blur();
            });

            cell.appendChild(textarea);
            textarea.focus();
            return;
        }

        // View mode
        if (tasks.length === 0) {
            if (!locked) {
                const ph = document.createElement('span');
                ph.className   = 'block-placeholder';
                ph.textContent = 'click to add tasks';
                cell.appendChild(ph);
            }
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'task-list';

        tasks.forEach(task => {
            const li  = document.createElement('li');
            const cb  = document.createElement('input');
            cb.type           = 'checkbox';
            cb.className      = 'task-checkbox';
            cb.checked        = task.completed;
            cb.dataset.taskId = task.id;
            if (locked) cb.disabled = true;

            const span  = document.createElement('span');
            span.className  = 'task-text';
            span.textContent = task.text;
            if (task.completed) span.classList.add('completed');
            // In locked columns everything looks muted (via CSS), but keep completed strikethrough too

            li.appendChild(cb);
            li.appendChild(span);
            ul.appendChild(li);
        });

        cell.appendChild(ul);
    }

    function renderAllBlocks() {
        state.plans.forEach((_, idx) => {
            TIME_SLOTS.forEach(time => renderBlock(time, idx));
        });
    }

    function enterEditMode(time, planIndex) {
        const plan = state.plans[planIndex];
        if (!plan || plan.locked) return;
        const cell = getCell(time, plan.id);
        if (!cell || cell.dataset.mode === 'edit') return;
        cell.dataset.mode = 'edit';
        getOrCreateBlock(time, planIndex);
        renderBlock(time, planIndex);
    }

    function handleCheckboxToggle(checkbox, time, planIndex) {
        const block = getBlock(time, planIndex);
        if (!block) return;
        const task = block.tasks.find(t => t.id === checkbox.dataset.taskId);
        if (!task) return;
        task.completed = !task.completed;
        saveData();
        renderBlock(time, planIndex);
    }

    // ========================================
    // PLAN DOM MANAGEMENT
    // ========================================

    function initializePlanDOM() {
        // Tag the first header and all initial cells as plan "a"
        const firstHeader = document.querySelector('#daily-table thead th.column-header');
        if (firstHeader) {
            firstHeader.dataset.plan = 'a';
            firstHeader.textContent  = 'Plan A';
        }
        document.querySelectorAll('.block-cell').forEach(cell => {
            if (!cell.dataset.plan) cell.dataset.plan = 'a';
        });
        wireCellsForPlan(0);
    }

    function wireCellsForPlan(planIndex) {
        const plan = state.plans[planIndex];
        document.querySelectorAll(`.block-cell[data-plan="${plan.id}"]`).forEach(cell => {
            const time = cell.dataset.time;
            // Clone to remove any old listeners
            const fresh = cell.cloneNode(true);
            cell.parentNode.replaceChild(fresh, cell);
            fresh.addEventListener('click', function (e) {
                if (e.target.classList.contains('task-checkbox')) {
                    handleCheckboxToggle(e.target, time, planIndex);
                    return;
                }
                if (!state.plans[planIndex].locked) {
                    enterEditMode(time, planIndex);
                }
            });
        });
    }

    function addPlanColumnToDOM(plan, planIndex) {
        const planId = plan.id;

        // Add <th>
        const thead = document.querySelector('#daily-table thead tr');
        const th    = document.createElement('th');
        th.className       = 'column-header';
        th.dataset.plan    = planId;
        th.textContent     = plan.label;
        thead.appendChild(th);

        // Add <td> to each row
        TIME_SLOTS.forEach(time => {
            const row = findRowByTime(time);
            if (!row) return;
            const td = document.createElement('td');
            td.className      = 'block-cell';
            td.dataset.time   = time;
            td.dataset.plan   = planId;
            row.appendChild(td);

            td.addEventListener('click', function (e) {
                if (e.target.classList.contains('task-checkbox')) {
                    handleCheckboxToggle(e.target, time, planIndex);
                    return;
                }
                if (!state.plans[planIndex].locked) {
                    enterEditMode(time, planIndex);
                }
            });
        });
    }

    function lockPlanColumnDOM(planId) {
        const header = document.querySelector(`th[data-plan="${planId}"]`);
        if (header) header.classList.add('locked');
        document.querySelectorAll(`.block-cell[data-plan="${planId}"]`).forEach(cell => {
            cell.classList.add('locked');
            delete cell.dataset.mode;   // exit any edit mode
        });
    }

    function cleanExtraPlanColumns() {
        document.querySelectorAll('th[data-plan]:not([data-plan="a"])').forEach(el => el.remove());
        document.querySelectorAll('td.block-cell[data-plan]:not([data-plan="a"])').forEach(el => el.remove());
        // Restore Plan A header label
        const aHeader = document.querySelector('th[data-plan="a"]');
        if (aHeader) aHeader.textContent = 'Plan A';
    }

    // ========================================
    // STORAGE — DAILY
    // ========================================

    function saveData() {
        const data = {
            plans: state.plans.map(plan => ({
                id: plan.id, label: plan.label,
                locked: plan.locked, lockedAt: plan.lockedAt,
                blocks: Object.values(plan.blocks).map(block => ({
                    time: block.time, blockName: block.blockName || null,
                    tasks: block.tasks.map(t => ({
                        id: t.id, text: t.text, completed: t.completed,
                        createdAt: t.createdAt,
                        pivotedFrom: t.pivotedFrom || null,
                        rolledFrom:  t.rolledFrom  || null
                    }))
                }))
            })),
            activePlanIndex: state.activePlanIndex
        };
        localStorage.setItem(getStorageKey(state.selectedDay), JSON.stringify(data));
        showSaveIndicator();
    }

    function normalizePlanData(planData) {
        return {
            id:       planData.id       || 'a',
            label:    planData.label    || 'Plan A',
            locked:   planData.locked   || false,
            lockedAt: planData.lockedAt || null,
            blocks: {}
        };
    }

    function loadBlocksIntoPlan(plan, rawBlocks) {
        (rawBlocks || []).forEach(block => {
            plan.blocks[block.time] = {
                time: block.time,
                blockName: block.blockName || null,
                tasks: (block.tasks || []).map(t => ({
                    id:          t.id          || generateId(),
                    text:        t.text,
                    completed:   t.completed   || false,
                    createdAt:   t.createdAt   || Date.now(),
                    pivotedFrom: t.pivotedFrom || null,
                    rolledFrom:  t.rolledFrom  || null
                }))
            };
        });
    }

    function migrateOldData(raw) {
        // Cycle 01 array format: [{time, cells:[{col, content:[{text,completed}]}]}]
        if (Array.isArray(raw)) {
            return [{
                id: 'a', label: 'Plan A', locked: false, lockedAt: null,
                blocks: raw.map(row => {
                    const tasks = [];
                    (row.cells || []).forEach(c => {
                        (c.content || []).forEach(t => tasks.push({
                            id: generateId(), text: t.text || '',
                            completed: t.completed || false, createdAt: Date.now()
                        }));
                    });
                    return { time: row.time, blockName: null, tasks };
                })
            }];
        }
        // Cycle 02a format: { blocks: [...] }
        if (raw.blocks && !raw.plans) {
            return [{
                id: 'a', label: 'Plan A', locked: false, lockedAt: null,
                blocks: raw.blocks
            }];
        }
        return null; // already new format
    }

    function loadData(date) {
        // Reset state to single Plan A
        state.plans          = [{ id: 'a', label: 'Plan A', locked: false, lockedAt: null, blocks: {} }];
        state.activePlanIndex = 0;
        cleanExtraPlanColumns();
        // Remove locked class from Plan A column
        document.querySelectorAll('[data-plan="a"]').forEach(el => el.classList.remove('locked'));

        const raw = localStorage.getItem(getStorageKey(date));
        if (!raw) { renderAllBlocks(); return false; }

        try {
            let parsed = JSON.parse(raw);

            // Migrate old formats to plans array
            const migrated = migrateOldData(parsed);
            if (migrated) parsed = { plans: migrated, activePlanIndex: 0 };

            if (parsed.plans) {
                state.plans          = parsed.plans.map(normalizePlanData);
                state.activePlanIndex = parsed.activePlanIndex || 0;

                parsed.plans.forEach((pd, idx) => {
                    loadBlocksIntoPlan(state.plans[idx], pd.blocks);
                });

                // Restore extra plan columns in DOM
                state.plans.slice(1).forEach((plan, i) => {
                    addPlanColumnToDOM(plan, i + 1);
                });

                // Restore locked visual state
                state.plans.forEach(plan => {
                    if (plan.locked) lockPlanColumnDOM(plan.id);
                });
            }

            renderAllBlocks();
            return true;
        } catch (e) {
            console.error('Error loading data:', e);
            renderAllBlocks();
            return false;
        }
    }

    function showSaveIndicator() {
        const el = document.getElementById('save-indicator');
        if (el) {
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 2000);
        }
    }

    // ========================================
    // STORAGE — WEEKLY INTENTIONS
    // ========================================

    function getWeekIntentionsKey() { return `if_intentions_${getCurrentWeek()}`; }

    function loadWeekIntentions() {
        try { return JSON.parse(localStorage.getItem(getWeekIntentionsKey())) || []; }
        catch (e) { return []; }
    }

    function saveWeekIntentions(arr) {
        localStorage.setItem(getWeekIntentionsKey(), JSON.stringify(arr));
        showSaveIndicator();
    }

    // ========================================
    // STATE QUERIES
    // ========================================

    function getCurrentTimeBlock() {
        const time  = getCurrentTimeSlot();
        const block = getBlock(time);
        const row   = findRowByTime(time);
        const rows  = Array.from(getTableRows());
        const content = block ? block.tasks : [];
        return { time, content, cell: row, isEmpty: content.length === 0,
                 index: row ? rows.indexOf(row) : -1 };
    }

    function getDayState() {
        const ap = activePlan();
        let totalTasks = 0, completedTasks = 0;
        const blocks = TIME_SLOTS.map(time => {
            const block   = ap.blocks[time];
            const content = block ? block.tasks : [];
            totalTasks    += content.length;
            completedTasks += content.filter(t => t.completed).length;
            return { time, content, isEmpty: content.length === 0 };
        });
        return {
            day: getDayOfWeek(state.selectedDay), week: getCurrentWeek(),
            plan: ap.label, blocks,
            completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
            totalBlocks: blocks.length, totalTasks, completedTasks
        };
    }

    // ========================================
    // WEEK PANEL UI
    // ========================================

    function initWeekPanel() {
        const label = document.getElementById('week-label');
        if (label) label.textContent = getCurrentWeek();

        const textarea = document.getElementById('week-intentions');
        if (textarea) {
            textarea.value = loadWeekIntentions().join('\n');
            textarea.addEventListener('blur', function () {
                saveWeekIntentions(
                    this.value.split('\n').map(l => l.trim()).filter(Boolean)
                );
            });
        }

        const closeBtn = document.getElementById('week-panel-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (textarea) {
                    saveWeekIntentions(
                        textarea.value.split('\n').map(l => l.trim()).filter(Boolean)
                    );
                }
                toggleWeekPanel(false);
            });
        }
    }

    function toggleWeekPanel(show) {
        const panel = document.getElementById('week-panel');
        if (!panel) return;
        if (show === undefined) {
            panel.classList.toggle('hidden');
        } else {
            panel.classList.toggle('hidden', !show);
        }
    }

    // ========================================
    // ORIENT PANEL UI
    // ========================================

    function showOrientPanel(html) {
        const panel   = document.getElementById('orient-panel');
        const content = document.getElementById('orient-content');
        if (!panel || !content) return;
        content.innerHTML = html;
        panel.classList.remove('hidden');
    }

    function closeOrientPanel() {
        const panel = document.getElementById('orient-panel');
        if (panel) panel.classList.add('hidden');
    }

    // ========================================
    // ORIENT COMMAND
    // ========================================

    function orient(scope) {
        scope = (scope || '').trim() || 'block';
        if (scope === 'block') return orientBlock();
        if (scope === 'day')   return orientDay();
        if (scope === 'week')  return orientWeek();
        return { error: `Unknown scope: ${scope}. Use: block, day, week` };
    }

    function orientBlock() {
        const block      = getCurrentTimeBlock();
        const incomplete = block.content.filter(t => !t.completed);
        const complete   = block.content.filter(t => t.completed);

        let suggestion;
        if (block.isEmpty)              suggestion = 'Empty block. Add tasks or carve: carve deep work';
        else if (incomplete.length === 0) suggestion = 'All done. Document outcomes or move on.';
        else if (complete.length === 0)   suggestion = `Get started: ${incomplete[0].text}`;
        else suggestion = `Keep going: ${incomplete[0].text} (${complete.length}/${block.content.length} done)`;

        let html = `<div class="orient-header">orient · block · ${block.time}</div>`;
        if (block.isEmpty) {
            html += `<p class="orient-empty">empty block</p>`;
        } else {
            html += `<ul class="orient-tasks">`;
            block.content.forEach(t => {
                html += `<li class="${t.completed ? 'done' : ''}">${t.completed ? '✓' : '○'} ${t.text}</li>`;
            });
            html += `</ul>`;
        }
        html += `<div class="orient-suggestion">→ ${suggestion}</div>`;
        showOrientPanel(html);

        return { scope: 'block', time: block.time, tasks: block.content,
                 incomplete: incomplete.length, complete: complete.length, suggestion };
    }

    function orientDay() {
        const dayState   = getDayState();
        const intentions = loadWeekIntentions();
        const emptyBlocks = dayState.blocks.filter(b => b.isEmpty).length;

        let suggestedFocus = intentions[0] || null;
        for (const intention of intentions) {
            const kw = intention.toLowerCase().split(' ')[0];
            const hasBlock = dayState.blocks.some(b => b.content.some(t => t.text.toLowerCase().includes(kw)));
            if (!hasBlock) { suggestedFocus = intention; break; }
        }

        let html = `<div class="orient-header">orient · day · ${dayState.day} · ${dayState.plan}</div>`;

        if (intentions.length > 0) {
            html += `<div class="orient-section"><div class="orient-label">this week</div><ul class="orient-tasks">`;
            intentions.forEach(i => { html += `<li>· ${i}</li>`; });
            html += `</ul></div>`;
        } else {
            html += `<div class="orient-section orient-empty">no weekly intentions — try: orient week</div>`;
        }

        html += `<div class="orient-section"><div class="orient-label">today</div>
                 <div class="orient-stat">${dayState.completedTasks}/${dayState.totalTasks} tasks done`;
        if (emptyBlocks > 0) html += ` · ${emptyBlocks} blocks unplanned`;
        html += `</div></div>`;
        if (suggestedFocus) html += `<div class="orient-suggestion">→ focus: ${suggestedFocus}</div>`;

        showOrientPanel(html);
        return { scope: 'day', day: dayState.day, week: dayState.week, weekIntentions: intentions,
                 totalTasks: dayState.totalTasks, completedTasks: dayState.completedTasks,
                 completionRate: Math.round(dayState.completionRate * 100),
                 emptyBlocks, suggestedFocus };
    }

    function orientWeek() {
        const intentions = loadWeekIntentions();
        toggleWeekPanel(true);
        return { scope: 'week', week: getCurrentWeek(), intentions, count: intentions.length };
    }

    // ========================================
    // COMMANDS: POST / PATCH
    // ========================================

    function postBlock(params) {
        let p;
        try { p = typeof params === 'string' ? JSON.parse(params) : params; }
        catch (e) { return { success: false, error: 'Invalid JSON: ' + e.message }; }

        const time  = p.time || getCurrentTimeSlot();
        const block = getOrCreateBlock(time);
        const newTasks = (p.tasks || []).map(t => ({
            id: generateId(),
            text: typeof t === 'string' ? t : t.text,
            completed: typeof t === 'object' ? (t.completed || false) : false,
            createdAt: Date.now()
        }));
        block.tasks.push(...newTasks);
        saveData();
        renderBlock(time);
        return { success: true, time, added: newTasks.length, tasks: newTasks };
    }

    function patchBlock(params) {
        let p;
        try { p = typeof params === 'string' ? JSON.parse(params) : params; }
        catch (e) { return { success: false, error: 'Invalid JSON: ' + e.message }; }

        const time  = p.time || getCurrentTimeSlot();
        const block = getBlock(time);
        if (!block) return { success: false, error: 'Block not found at ' + time };

        if (p.taskId && p.updates) {
            const task = block.tasks.find(t => t.id === p.taskId);
            if (!task) return { success: false, error: 'Task not found: ' + p.taskId };
            Object.assign(task, p.updates);
        }
        saveData();
        renderBlock(time);
        return { success: true, time, block };
    }

    // ========================================
    // COMMAND: PIVOT
    // ========================================

    function pivot() {
        if (state.plans.length >= 3) {
            return { success: false, message: 'Already at Plan C — max 3 plans per day.' };
        }

        const current        = activePlan();
        const incompleteTasks = [];

        TIME_SLOTS.forEach(time => {
            const block = current.blocks[time];
            if (block) {
                block.tasks.filter(t => !t.completed).forEach(t => {
                    incompleteTasks.push({ ...t, originalTime: time });
                });
            }
        });

        if (incompleteTasks.length === 0) {
            // Nothing to migrate — just add the new column directly
            executePivot([]);
            return { success: true, message: `Pivoted to ${PLAN_LABELS[state.plans.length - 1]}. No incomplete tasks.` };
        }

        showPivotMigrationUI(incompleteTasks);
        return { success: true, pending: true,
                 message: `Choose tasks to carry to ${PLAN_LABELS[state.plans.length]}.` };
    }

    function showPivotMigrationUI(incompleteTasks) {
        const nextLabel = PLAN_LABELS[state.plans.length];

        let html = `<div class="orient-header">pivot · carry to ${nextLabel}</div>`;
        html += `<div class="pivot-task-list">`;

        incompleteTasks.forEach((task, idx) => {
            const slotOptions = TIME_SLOTS.map(slot =>
                `<option value="${slot}" ${slot === task.originalTime ? 'selected' : ''}>${slot}</option>`
            ).join('');

            html += `
                <div class="pivot-task-item" data-idx="${idx}">
                    <label class="pivot-task-label">
                        <input type="checkbox" class="pivot-include" data-task-id="${task.id}" checked>
                        <span>${task.text}</span>
                    </label>
                    <span class="pivot-task-origin">from ${task.originalTime}</span>
                    <select class="pivot-task-slot" data-task-id="${task.id}">${slotOptions}</select>
                </div>
            `;
        });

        html += `</div>`;
        html += `<div class="pivot-actions">
            <button class="control-button" id="pivot-confirm-btn">pivot →</button>
            <button class="control-button" id="pivot-cancel-btn">cancel</button>
        </div>`;

        showOrientPanel(html);

        document.getElementById('pivot-confirm-btn').addEventListener('click', () => {
            const selected = [];
            document.querySelectorAll('.pivot-task-item').forEach(item => {
                const cb   = item.querySelector('.pivot-include');
                const slot = item.querySelector('.pivot-task-slot');
                if (cb.checked) {
                    const task = incompleteTasks.find(t => t.id === cb.dataset.taskId);
                    if (task) selected.push({ ...task, targetTime: slot.value });
                }
            });
            executePivot(selected);
        });

        document.getElementById('pivot-cancel-btn').addEventListener('click', closeOrientPanel);
    }

    function executePivot(tasksToMigrate) {
        const current = activePlan();
        const newIdx  = state.plans.length;
        const newId   = PLAN_IDS[newIdx];
        const newPlan = {
            id: newId, label: PLAN_LABELS[newIdx],
            locked: false, lockedAt: null, blocks: {}
        };

        // Lock current plan
        current.locked   = true;
        current.lockedAt = new Date().toISOString();
        lockPlanColumnDOM(current.id);
        // Re-render locked plan so checkboxes disable
        TIME_SLOTS.forEach(time => renderBlock(time, state.activePlanIndex));

        // Migrate selected tasks into new plan
        tasksToMigrate.forEach(t => {
            const targetTime = t.targetTime || t.originalTime;
            if (!newPlan.blocks[targetTime]) {
                newPlan.blocks[targetTime] = { time: targetTime, blockName: null, tasks: [] };
            }
            newPlan.blocks[targetTime].tasks.push({
                id: generateId(), text: t.text, completed: false,
                createdAt: Date.now(),
                pivotedFrom: `plan-${current.id}-${t.originalTime}`
            });
        });

        state.plans.push(newPlan);
        state.activePlanIndex = newIdx;

        addPlanColumnToDOM(newPlan, newIdx);
        TIME_SLOTS.forEach(time => renderBlock(time, newIdx));

        saveData();
        closeOrientPanel();

        return { success: true, from: current.label, to: newPlan.label,
                 tasksMigrated: tasksToMigrate.length };
    }

    // ========================================
    // COMMAND: CARVE
    // ========================================

    function carve(params) {
        if (!params || !params.trim()) {
            return { success: false, message: 'Usage: carve <name> or carve <time-range> <name>' };
        }

        const parts = params.trim().split(/\s+/);
        let timeRange = null, blockName = '';

        if (parts[0].match(/^\d{1,2}(am|pm)-\d{1,2}(am|pm)$/)) {
            timeRange = parts[0];
            blockName = parts.slice(1).join(' ');
        } else {
            blockName = params.trim();
        }

        if (!blockName) return { success: false, message: 'Block name required' };

        const times = timeRange ? getTimesInRange(timeRange) : [getCurrentTimeSlot()];
        if (times.length === 0) return { success: false, message: 'No matching slots for: ' + timeRange };

        times.forEach(time => {
            getOrCreateBlock(time).blockName = blockName;
            const row = findRowByTime(time);
            if (row) {
                const tc = row.querySelector('.time-cell');
                if (tc) {
                    const ex = tc.querySelector('.block-name');
                    if (ex) ex.remove();
                    const s = document.createElement('span');
                    s.className   = 'block-name';
                    s.textContent = ` [${blockName}]`;
                    tc.appendChild(s);
                }
            }
        });

        saveData();
        return { success: true, blockName, times,
                 message: `"${blockName}" carved (${times.length} block${times.length > 1 ? 's' : ''})` };
    }

    function getTimesInRange(range) {
        const [sr, er] = range.split('-');
        function norm(t) {
            const m = t.match(/^(\d{1,2})(am|pm)$/);
            if (!m) return null;
            let h = parseInt(m[1]);
            if (m[2] === 'pm' && h !== 12) h += 12;
            if (m[2] === 'am' && h === 12) h = 0;
            const h12  = h > 12 ? h - 12 : (h === 0 ? 12 : h);
            const ampm = h >= 12 ? 'pm' : 'am';
            return `${String(h12).padStart(2, '0')}:00${ampm}`;
        }
        const start = norm(sr), end = norm(er);
        if (!start || !end) return [];
        let on = false;
        return TIME_SLOTS.filter(s => {
            if (s === start) on = true;
            const keep = on;
            if (s === end) on = false;
            return keep;
        });
    }

    // ========================================
    // COMMAND: SHUTDOWN
    // ========================================

    function shutdown() {
        const dayState       = getDayState();
        const movedToTomorrow = [];

        dayState.blocks.forEach(block => {
            block.content.filter(t => !t.completed).forEach(t => {
                movedToTomorrow.push({ task: t.text, originalTime: block.time });
            });
        });

        if (movedToTomorrow.length > 0) {
            const tomorrow    = new Date(state.selectedDay);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const key         = getStorageKey(tomorrow);
            let tomorrowData;
            try { tomorrowData = JSON.parse(localStorage.getItem(key)) || { plans: [{ id:'a', label:'Plan A', locked:false, lockedAt:null, blocks:[] }], activePlanIndex:0 }; }
            catch (e) { tomorrowData = { plans: [{ id:'a', label:'Plan A', locked:false, lockedAt:null, blocks:[] }], activePlanIndex:0 }; }

            if (!tomorrowData.plans) tomorrowData = { plans: [{ id:'a', label:'Plan A', locked:false, lockedAt:null, blocks: tomorrowData.blocks || [] }], activePlanIndex:0 };

            let planA = tomorrowData.plans.find(p => p.id === 'a');
            if (!planA) { planA = { id:'a', label:'Plan A', locked:false, lockedAt:null, blocks:[] }; tomorrowData.plans.push(planA); }

            let rollover = planA.blocks.find(b => b.time === TIME_SLOTS[0]);
            if (!rollover) { rollover = { time: TIME_SLOTS[0], blockName: null, tasks: [] }; planA.blocks.push(rollover); }

            movedToTomorrow.forEach(m => {
                rollover.tasks.push({
                    id: generateId(), text: m.task, completed: false,
                    createdAt: Date.now(),
                    rolledFrom: `${dayState.day}-${m.originalTime}`
                });
            });

            localStorage.setItem(key, JSON.stringify(tomorrowData));
        }

        const rate = Math.round(dayState.completionRate * 100);
        let html   = `<div class="orient-header">shutdown · ${dayState.day} · ${dayState.plan}</div>`;
        html += `<div class="orient-section"><div class="orient-stat">${rate}% complete · ${movedToTomorrow.length} task(s) moved to tomorrow</div>`;
        if (movedToTomorrow.length > 0) {
            html += `<ul class="orient-tasks">`;
            movedToTomorrow.forEach(m => { html += `<li>→ ${m.task}</li>`; });
            html += `</ul>`;
        }
        html += `</div><div class="orient-suggestion">shutdown complete.</div>`;
        showOrientPanel(html);

        return { success: true, completionRate: rate,
                 completed: dayState.completedTasks,
                 incomplete: dayState.totalTasks - dayState.completedTasks,
                 moved: movedToTomorrow.length };
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* ---- Block editor ---- */
            .block-editor {
                width: 100%; min-height: 60px; border: none; outline: none;
                font-family: 'Comic Neue', 'Comic Sans MS', cursive;
                font-size: 14px; line-height: 1.6; resize: vertical;
                background: transparent; padding: 4px; box-sizing: border-box;
            }
            .block-placeholder { color: #ccc; font-style: italic; font-size: 13px; cursor: pointer; }
            .block-name { font-size: 11px; color: #888; font-weight: normal; }

            /* ---- Locked plan columns ---- */
            th[data-plan].locked {
                width: 72px; min-width: 60px; max-width: 80px;
                color: #bbb; font-size: 11px; font-weight: normal;
            }
            td.block-cell.locked {
                width: 72px; min-width: 60px; max-width: 80px;
                opacity: 0.55; font-size: 12px;
                background: repeating-linear-gradient(
                    135deg, transparent, transparent 4px,
                    rgba(0,0,0,0.03) 4px, rgba(0,0,0,0.03) 8px
                );
                cursor: default;
                overflow: hidden;
            }
            td.block-cell.locked .task-text { color: #aaa; }
            td.block-cell.locked .task-checkbox { opacity: 0.5; }

            /* ---- Week panel ---- */
            #week-panel {
                border: 2px solid #333; padding: 12px 16px;
                margin-bottom: 16px; background: #fffef7;
            }
            #week-panel.hidden { display: none; }
            .week-panel-header {
                display: flex; justify-content: space-between; align-items: center;
                margin-bottom: 6px; font-size: 13px;
            }
            .week-panel-prompt { font-size: 12px; color: #666; margin: 0 0 6px 0; font-style: italic; }
            #week-intentions {
                width: 100%; border: 1px solid #ccc; padding: 8px;
                font-family: 'Comic Neue', 'Comic Sans MS', cursive;
                font-size: 14px; line-height: 1.7; resize: vertical;
                box-sizing: border-box; background: transparent; outline: none;
            }

            /* ---- Orient / pivot panel ---- */
            #orient-panel {
                border: 2px solid #333; padding: 12px 16px;
                margin-bottom: 16px; background: #fffef7; position: relative;
            }
            #orient-panel.hidden { display: none; }
            #orient-panel-close { position: absolute; top: 8px; right: 8px; font-size: 11px; padding: 2px 8px; }
            .orient-header { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
            .orient-section { margin-bottom: 10px; }
            .orient-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .orient-tasks { list-style: none; margin: 0; padding: 0; }
            .orient-tasks li { font-size: 13px; line-height: 1.7; }
            .orient-tasks li.done { color: #aaa; text-decoration: line-through; }
            .orient-stat { font-size: 13px; color: #555; }
            .orient-empty { font-size: 13px; color: #aaa; font-style: italic; }
            .orient-suggestion { font-size: 13px; font-weight: bold; margin-top: 10px; padding-top: 8px; border-top: 1px solid #eee; }

            /* ---- Pivot migration UI ---- */
            .pivot-task-list { margin-bottom: 12px; }
            .pivot-task-item {
                display: flex; align-items: center; gap: 8px;
                padding: 4px 0; border-bottom: 1px solid #f0f0f0;
                font-size: 13px; flex-wrap: wrap;
            }
            .pivot-task-label { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; }
            .pivot-task-label span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .pivot-task-origin { font-size: 11px; color: #aaa; white-space: nowrap; }
            .pivot-task-slot {
                font-family: 'Comic Neue', 'Comic Sans MS', cursive;
                font-size: 12px; border: 1px solid #ccc; padding: 2px 4px;
                background: white; cursor: pointer;
            }
            .pivot-actions { display: flex; gap: 8px; margin-top: 10px; }
        `;
        document.head.appendChild(style);
    }

    function initializeDayDropdown() {
        const dropdown = document.getElementById('day-dropdown');
        if (!dropdown) return;

        const days  = getDaysOfWeek();
        const today = new Date().toDateString();
        const week  = getCurrentWeek();

        dropdown.innerHTML = '';
        days.forEach(day => {
            const opt = document.createElement('option');
            opt.value       = day.toDateString();
            opt.textContent = `${getDayOfWeek(day)}-weekof-${week}`;
            if (day.toDateString() === today) opt.selected = true;
            dropdown.appendChild(opt);
        });

        dropdown.addEventListener('change', function () {
            state.selectedDay = new Date(this.value);
            loadData(state.selectedDay);
        });
    }

    function init() {
        state.currentWeek = getCurrentWeek();
        injectStyles();
        initializePlanDOM();
        initializeDayDropdown();
        initWeekPanel();
        loadData(state.selectedDay);

        const closeBtn = document.getElementById('orient-panel-close');
        if (closeBtn) closeBtn.addEventListener('click', closeOrientPanel);

        console.log('Infinite Frontiers — Cycle 02b');
        console.log('orient · orient day · orient week · carve · pivot · shutdown');
    }

    // ========================================
    // NAMESPACES
    // ========================================

    const blockNS = {
        orient:   () => orientBlock(),
        getState: () => getCurrentTimeBlock(),
        carve:    (p) => carve(p),
        patch:    (p) => patchBlock(p),
        post:     (p) => postBlock(p),
        delete:   () => ({ status: 'pending' })
    };

    const weekNS = {
        orient:        () => orientWeek(),
        getState:      () => ({ week: getCurrentWeek(), intentions: loadWeekIntentions() }),
        getIntentions: ()  => loadWeekIntentions(),
        setIntentions: (a) => { saveWeekIntentions(a); return { success: true }; }
    };

    const quarterNS = {
        orient:   () => ({ status: 'pending', message: 'Quarter orient — Cycle 03' }),
        getState: () => ({ status: 'pending' })
    };

    const yearNS = {
        orient:   () => ({ status: 'pending', message: 'Year orient — future' }),
        getState: () => ({ status: 'pending' })
    };

    // ========================================
    // PUBLIC API
    // ========================================

    window.inf = {
        orient, pivot, shutdown, carve,
        getCurrentTimeBlock, getDayState, getState: getDayState,

        block:   blockNS,
        week:    weekNS,
        quarter: quarterNS,
        year:    yearNS,

        _state: state, _save: saveData, _load: loadData,
        _toggleWeekPanel: toggleWeekPanel
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
