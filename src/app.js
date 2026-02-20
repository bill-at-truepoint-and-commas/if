// Infinite Frontiers API - Cycle 01: textarea parse/render
// Main interface for AI agent interaction

(function() {
    'use strict';

    // ========================================
    // STATE MANAGEMENT
    // ========================================

    const state = {
        selectedDay: new Date(),
        currentWeek: null,
        blocks: {}  // keyed by time string, e.g. "09:00am"
    };

    const TIME_SLOTS = ['09:00am', '10:00am', '11:00am', '12:00pm',
                        '01:00pm', '02:00pm', '03:00pm', '04:00pm'];

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    function generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function getCurrentWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        monday.setDate(today.getDate() + diff);

        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[monday.getMonth()];
        const mondayDate = monday.getDate();
        const fridayDate = friday.getDate();

        return `${month}${mondayDate}-${fridayDate}`;
    }

    function getDayOfWeek(date) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    }

    function getStorageKey(date) {
        const dayName = getDayOfWeek(date);
        const week = getCurrentWeek();
        return `dayplanner_${dayName}_weekof_${week}`;
    }

    function getCurrentTimeSlot() {
        const now = new Date();
        const hour = now.getHours();

        if (hour < 9) return TIME_SLOTS[0];
        if (hour >= 16) return TIME_SLOTS[TIME_SLOTS.length - 1];

        const index = hour - 9;
        return TIME_SLOTS[index];
    }

    // ========================================
    // BLOCK ACCESSORS
    // ========================================

    function getBlock(time) {
        return state.blocks[time] || null;
    }

    function getOrCreateBlock(time) {
        if (!state.blocks[time]) {
            state.blocks[time] = { time, tasks: [], blockName: null };
        }
        return state.blocks[time];
    }

    // ========================================
    // PARSE / RENDER (textarea <-> task objects)
    // ========================================

    function parseTasksFromText(text, time) {
        const lines = text.split('\n');
        const existingTasks = state.blocks[time] ? state.blocks[time].tasks : [];
        const tasks = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const match = trimmed.match(/^-\s*\[([ xX])\]\s*(.+)$/);

            if (match) {
                const taskText = match[2].trim();
                const completed = match[1].toLowerCase() === 'x';
                const existing = existingTasks.find(t => t.text === taskText);
                tasks.push({
                    id: existing ? existing.id : generateId(),
                    text: taskText,
                    completed: completed,
                    createdAt: existing ? existing.createdAt : Date.now()
                });
            } else {
                const existing = existingTasks.find(t => t.text === trimmed);
                tasks.push({
                    id: existing ? existing.id : generateId(),
                    text: trimmed,
                    completed: false,
                    createdAt: existing ? existing.createdAt : Date.now()
                });
            }
        }

        return tasks;
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
        const rows = getTableRows();
        for (let row of rows) {
            if (row.dataset.time === time) {
                return row;
            }
        }
        return null;
    }

    function getCellContent(cell) {
        const time = cell.dataset.time;
        const block = state.blocks[time];
        return block ? block.tasks : [];
    }

    function setCellContent(cell, tasks) {
        const time = cell.dataset.time;
        const block = getOrCreateBlock(time);
        block.tasks = tasks.map(t => ({
            id: t.id || generateId(),
            text: t.text,
            completed: t.completed || false,
            createdAt: t.createdAt || Date.now()
        }));
        renderBlock(time);
    }

    // ========================================
    // RENDERING
    // ========================================

    function renderBlock(time) {
        const cell = document.querySelector(`.block-cell[data-time="${time}"]`);
        if (!cell) return;

        const block = state.blocks[time];
        const tasks = block ? block.tasks : [];

        cell.innerHTML = '';

        if (cell.dataset.mode === 'edit') {
            const textarea = document.createElement('textarea');
            textarea.className = 'block-editor';
            textarea.value = tasks.length > 0 ? renderTasksToText(tasks) : '';
            textarea.placeholder = '...';
            textarea.rows = Math.max(tasks.length + 1, 3);

            textarea.addEventListener('blur', function() {
                cell.dataset.mode = 'view';
                const parsed = parseTasksFromText(this.value, time);
                getOrCreateBlock(time).tasks = parsed;
                saveData();
                renderBlock(time);
            });

            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    this.blur();
                }
            });

            cell.appendChild(textarea);
            textarea.focus();
        } else {
            if (tasks.length === 0) {
                const placeholder = document.createElement('span');
                placeholder.className = 'block-placeholder';
                placeholder.textContent = 'click to add tasks';
                cell.appendChild(placeholder);
            } else {
                const ul = document.createElement('ul');
                ul.className = 'task-list';

                tasks.forEach(task => {
                    const li = document.createElement('li');

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'task-checkbox';
                    checkbox.checked = task.completed;
                    checkbox.dataset.taskId = task.id;

                    const textSpan = document.createElement('span');
                    textSpan.className = 'task-text';
                    textSpan.textContent = task.text;
                    if (task.completed) textSpan.classList.add('completed');

                    li.appendChild(checkbox);
                    li.appendChild(textSpan);
                    ul.appendChild(li);
                });

                cell.appendChild(ul);
            }
        }
    }

    function renderAllBlocks() {
        TIME_SLOTS.forEach(time => renderBlock(time));
    }

    function enterEditMode(time) {
        const cell = document.querySelector(`.block-cell[data-time="${time}"]`);
        if (!cell) return;
        if (cell.dataset.mode === 'edit') return;

        cell.dataset.mode = 'edit';
        getOrCreateBlock(time);
        renderBlock(time);
    }

    function handleCheckboxToggle(checkbox, time) {
        const taskId = checkbox.dataset.taskId;
        const block = state.blocks[time];
        if (!block) return;

        const task = block.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.completed = !task.completed;
        saveData();
        renderBlock(time);
    }

    // ========================================
    // STORAGE
    // ========================================

    function migrateOldData(oldData) {
        return {
            blocks: oldData.map(row => {
                let allTasks = [];
                if (row.cells && Array.isArray(row.cells)) {
                    row.cells.forEach(cellData => {
                        if (cellData.content && Array.isArray(cellData.content)) {
                            allTasks.push(...cellData.content);
                        }
                    });
                }

                return {
                    time: row.time,
                    blockName: null,
                    tasks: allTasks.map(task => ({
                        id: generateId(),
                        text: task.text || '',
                        completed: task.completed || false,
                        createdAt: Date.now()
                    }))
                };
            })
        };
    }

    function saveData() {
        const data = {
            blocks: Object.values(state.blocks).map(block => ({
                time: block.time,
                blockName: block.blockName || null,
                tasks: block.tasks.map(t => ({
                    id: t.id,
                    text: t.text,
                    completed: t.completed,
                    createdAt: t.createdAt
                }))
            }))
        };

        const storageKey = getStorageKey(state.selectedDay);
        localStorage.setItem(storageKey, JSON.stringify(data));
        showSaveIndicator();
    }

    function loadData(date) {
        const storageKey = getStorageKey(date);
        const raw = localStorage.getItem(storageKey);

        state.blocks = {};

        if (!raw) {
            renderAllBlocks();
            return false;
        }

        try {
            let parsed = JSON.parse(raw);

            if (Array.isArray(parsed)) {
                parsed = migrateOldData(parsed);
            }

            if (parsed.blocks) {
                parsed.blocks.forEach(block => {
                    state.blocks[block.time] = {
                        time: block.time,
                        blockName: block.blockName || null,
                        tasks: (block.tasks || []).map(t => ({
                            id: t.id || generateId(),
                            text: t.text,
                            completed: t.completed || false,
                            createdAt: t.createdAt || Date.now()
                        }))
                    };
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
        const indicator = document.getElementById('save-indicator');
        if (indicator) {
            indicator.classList.add('show');
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 2000);
        }
    }

    // ========================================
    // API: STATE QUERIES
    // ========================================

    function getCurrentTimeBlock() {
        const time = getCurrentTimeSlot();
        const block = state.blocks[time];
        const row = findRowByTime(time);
        const rows = Array.from(getTableRows());
        const index = row ? rows.indexOf(row) : -1;

        const content = block ? block.tasks : [];

        return {
            time,
            content,
            cell: row,
            isEmpty: content.length === 0,
            index
        };
    }

    function getDayState() {
        const blocks = [];
        let totalTasks = 0;
        let completedTasks = 0;

        TIME_SLOTS.forEach(time => {
            const block = state.blocks[time];
            const content = block ? block.tasks : [];

            totalTasks += content.length;
            completedTasks += content.filter(t => t.completed).length;

            blocks.push({
                time,
                content,
                isEmpty: content.length === 0
            });
        });

        return {
            day: getDayOfWeek(state.selectedDay),
            week: getCurrentWeek(),
            blocks,
            completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
            totalBlocks: blocks.length,
            totalTasks,
            completedTasks
        };
    }

    // ========================================
    // API: COMMANDS
    // ========================================

    function postBlock(params) {
        let parsed;
        try {
            parsed = typeof params === 'string' ? JSON.parse(params) : params;
        } catch (e) {
            return { success: false, error: 'Invalid JSON: ' + e.message };
        }

        const time = parsed.time || getCurrentTimeSlot();
        const block = getOrCreateBlock(time);

        const tasksInput = parsed.tasks || [];
        const newTasks = tasksInput.map(t => ({
            id: generateId(),
            text: typeof t === 'string' ? t : t.text,
            completed: typeof t === 'object' ? (t.completed || false) : false,
            createdAt: Date.now()
        }));

        block.tasks.push(...newTasks);
        saveData();
        renderBlock(time);

        return {
            success: true,
            time,
            added: newTasks.length,
            tasks: newTasks
        };
    }

    function patchBlock(params) {
        let parsed;
        try {
            parsed = typeof params === 'string' ? JSON.parse(params) : params;
        } catch (e) {
            return { success: false, error: 'Invalid JSON: ' + e.message };
        }

        const time = parsed.time || getCurrentTimeSlot();
        const block = getBlock(time);
        if (!block) return { success: false, error: 'Block not found at ' + time };

        if (parsed.taskId && parsed.updates) {
            const task = block.tasks.find(t => t.id === parsed.taskId);
            if (!task) return { success: false, error: 'Task not found: ' + parsed.taskId };
            Object.assign(task, parsed.updates);
        }

        saveData();
        renderBlock(time);

        return { success: true, time, block };
    }

    function pivot() {
        const currentTime = getCurrentTimeSlot();
        const currentBlock = getCurrentTimeBlock();

        if (!currentBlock.cell) {
            return {
                success: false,
                message: 'Could not find current time block',
                time: currentTime
            };
        }

        const row = currentBlock.cell;
        const revisionCells = row.querySelectorAll('[data-col="1"], [data-col="2"], [data-col="3"]');

        let currentCol = null;
        let nextCol = null;

        for (let i = 0; i < revisionCells.length; i++) {
            const cell = revisionCells[i];
            const content = getCellContent(cell);

            if (content.length > 0 && !cell.classList.contains('revised')) {
                currentCol = cell;
                if (i < revisionCells.length - 1) {
                    nextCol = revisionCells[i + 1];
                }
                break;
            }
        }

        if (!currentCol) {
            return {
                success: false,
                message: 'No active tasks to pivot',
                time: currentTime
            };
        }

        if (!nextCol) {
            return {
                success: false,
                message: 'No more revision columns available (at 3)',
                time: currentTime
            };
        }

        const tasks = getCellContent(currentCol);
        const incompleteTasks = tasks.filter(t => !t.completed);

        if (incompleteTasks.length === 0) {
            return {
                success: false,
                message: 'All tasks complete, nothing to pivot',
                time: currentTime
            };
        }

        currentCol.classList.add('revised');

        const nextColTasks = getCellContent(nextCol);
        setCellContent(nextCol, [...incompleteTasks, ...nextColTasks]);

        saveData();

        return {
            success: true,
            time: currentTime,
            revisedFrom: currentCol.dataset.col,
            revisedTo: nextCol.dataset.col,
            tasksMoved: incompleteTasks.length,
            tasks: incompleteTasks.map(t => t.text)
        };
    }

    function carve(params) {
        if (!params || params.trim() === '') {
            return {
                success: false,
                message: 'No name provided. Usage: carve <name> or carve <time-range> <name>'
            };
        }

        const parts = params.trim().split(/\s+/);
        let timeRange = null;
        let blockName = '';

        if (parts[0].match(/^\d{1,2}(am|pm)-\d{1,2}(am|pm)$/)) {
            timeRange = parts[0];
            blockName = parts.slice(1).join(' ');
        } else {
            blockName = params.trim();
        }

        if (!blockName) {
            return {
                success: false,
                message: 'Block name required'
            };
        }

        if (!timeRange) {
            const currentBlock = getCurrentTimeBlock();
            if (!currentBlock.cell) {
                return {
                    success: false,
                    message: 'Could not determine current time block'
                };
            }

            const time = currentBlock.time;
            const block = getOrCreateBlock(time);
            block.blockName = blockName;

            const row = currentBlock.cell;
            const timeCell = row.querySelector('.time-cell');
            if (timeCell) {
                const existing = timeCell.querySelector('.block-name');
                if (existing) existing.remove();
                const nameSpan = document.createElement('span');
                nameSpan.className = 'block-name';
                nameSpan.textContent = ` [${blockName}]`;
                timeCell.appendChild(nameSpan);
            }

            saveData();

            return {
                success: true,
                time,
                blockName,
                message: `Block "${blockName}" carved at ${time}`
            };
        }

        const [startTime, endTime] = timeRange.split('-');
        const affectedRows = [];

        const rows = getTableRows();
        let inRange = false;

        rows.forEach(row => {
            const time = row.dataset.time;

            if (time === startTime) {
                inRange = true;
            }

            if (inRange) {
                affectedRows.push(row);
                const block = getOrCreateBlock(time);
                block.blockName = blockName;

                const timeCell = row.querySelector('.time-cell');
                if (timeCell) {
                    const existing = timeCell.querySelector('.block-name');
                    if (existing) existing.remove();
                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'block-name';
                    nameSpan.textContent = ` [${blockName}]`;
                    timeCell.appendChild(nameSpan);
                }
            }

            if (time === endTime) {
                inRange = false;
            }
        });

        saveData();

        return {
            success: true,
            timeRange,
            blockName,
            affectedBlocks: affectedRows.length,
            message: `Block "${blockName}" carved from ${timeRange} (${affectedRows.length} hours)`
        };
    }

    function expandNow() {
        const currentBlock = getCurrentTimeBlock();

        if (currentBlock.cell) {
            const cells = currentBlock.cell.querySelectorAll('.block-cell');
            cells.forEach(cell => {
                cell.classList.add('current-time');
            });
        }

        const actions = generateActions(currentBlock);
        showActionPanel(currentBlock, actions);

        return {
            block: currentBlock,
            actions,
            expanded: true
        };
    }

    function generateActions(block) {
        const actions = {
            getStarted: [],
            makeProgress: [],
            finish: []
        };

        if (block.isEmpty) {
            actions.getStarted = [
                'Define primary objective for this block',
                'List key deliverables',
                'Set up work environment'
            ];
            return actions;
        }

        const incompleteTasks = block.content.filter(t => !t.completed);
        const completedTasks = block.content.filter(t => t.completed);

        if (incompleteTasks.length === 0) {
            actions.finish = [
                'Document what was accomplished',
                'Update stakeholders',
                'Plan next steps'
            ];
        } else if (completedTasks.length === 0) {
            actions.getStarted = incompleteTasks.map(t => `Start: ${t.text}`);
            actions.makeProgress = [
                'Break down first task into smaller steps',
                'Identify any blockers',
                'Set a 25-minute timer for focused work'
            ];
        } else {
            actions.makeProgress = incompleteTasks.map(t => `Continue: ${t.text}`);
            actions.finish = [
                'Complete remaining tasks',
                'Review quality of completed work',
                'Document outcomes'
            ];
        }

        return actions;
    }

    function showActionPanel(block, actions) {
        const panel = document.getElementById('action-panel');
        const title = document.getElementById('panel-title');
        const content = document.getElementById('panel-content');

        if (!panel || !title || !content) return;

        title.textContent = `Current Block: ${block.time}`;

        let html = '';

        if (block.isEmpty) {
            html += '<p style="margin-bottom: 16px; color: #666;">This time block is empty.</p>';
        } else {
            html += '<div class="action-section"><h4>Current Tasks:</h4><ul class="action-list">';
            block.content.forEach(task => {
                const status = task.completed ? '✓' : '○';
                html += `<li>${status} ${task.text}</li>`;
            });
            html += '</ul></div>';
        }

        ['getStarted', 'makeProgress', 'finish'].forEach(key => {
            if (actions[key].length > 0) {
                const label = key === 'getStarted' ? 'Get Started' :
                             key === 'makeProgress' ? 'Make Progress' : 'Finish & Document';
                html += `<div class="action-section"><h4>${label}:</h4><ul class="action-list">`;
                actions[key].forEach(action => {
                    html += `<li>${action}</li>`;
                });
                html += '</ul></div>';
            }
        });

        content.innerHTML = html;
        panel.classList.remove('hidden');
    }

    function closeActionPanel() {
        const panel = document.getElementById('action-panel');
        if (panel) {
            panel.classList.add('hidden');
        }

        document.querySelectorAll('.current-time').forEach(cell => {
            cell.classList.remove('current-time');
        });
    }

    function shutdown() {
        const dayState = getDayState();
        const completed = [];
        const incomplete = [];
        const movedToTomorrow = [];

        dayState.blocks.forEach(block => {
            const incompleteTasks = block.content.filter(t => !t.completed);
            const completedTasks = block.content.filter(t => t.completed);

            if (completedTasks.length > 0) {
                completed.push({
                    time: block.time,
                    tasks: completedTasks
                });
            }

            if (incompleteTasks.length > 0) {
                incomplete.push({
                    time: block.time,
                    tasks: incompleteTasks
                });

                incompleteTasks.forEach(task => {
                    movedToTomorrow.push({
                        task: task.text,
                        originalTime: block.time,
                        newTime: '09:00am'
                    });
                });
            }
        });

        if (movedToTomorrow.length > 0) {
            const tomorrow = new Date(state.selectedDay);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const tomorrowKey = getStorageKey(tomorrow);
            const movedTasks = movedToTomorrow.map(m => ({
                text: m.task,
                completed: false,
                movedFrom: `${getDayOfWeek(state.selectedDay)}-${m.originalTime}`
            }));

            localStorage.setItem(tomorrowKey + '_moved', JSON.stringify(movedTasks));
        }

        const result = {
            completed,
            incomplete,
            movedToTomorrow,
            summary: {
                totalBlocks: dayState.totalBlocks,
                completed: completed.length,
                incomplete: incomplete.length,
                moved: movedToTomorrow.length
            }
        };

        console.log('Shutdown complete:', result);
        alert(`Day complete!\n\nCompleted: ${result.summary.completed} blocks\nIncomplete: ${result.summary.incomplete} blocks\nMoved to tomorrow: ${result.summary.moved} tasks`);

        return result;
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    function initializeCells() {
        const cells = document.querySelectorAll('.block-cell');

        cells.forEach(cell => {
            const time = cell.dataset.time;

            cell.addEventListener('click', function(e) {
                if (e.target.classList.contains('task-checkbox')) {
                    handleCheckboxToggle(e.target, time);
                    return;
                }
                enterEditMode(time);
            });
        });
    }

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .block-editor {
                width: 100%;
                min-height: 60px;
                border: none;
                outline: none;
                font-family: 'Comic Neue', 'Comic Sans MS', cursive;
                font-size: 14px;
                line-height: 1.6;
                resize: vertical;
                background: transparent;
                padding: 4px;
                box-sizing: border-box;
            }
            .block-placeholder {
                color: #ccc;
                font-style: italic;
                font-size: 13px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    function initializeDayDropdown() {
        const dropdown = document.getElementById('day-dropdown');
        if (!dropdown) return;

        const days = getDaysOfWeek();
        const today = new Date().toDateString();
        const currentWeek = getCurrentWeek();

        dropdown.innerHTML = '';
        days.forEach(day => {
            const option = document.createElement('option');
            const dayName = getDayOfWeek(day);
            option.value = day.toDateString();
            option.textContent = `${dayName}-weekof-${currentWeek}`;
            if (day.toDateString() === today) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });

        dropdown.addEventListener('change', function() {
            switchDay(new Date(this.value));
        });
    }

    function getDaysOfWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        monday.setDate(today.getDate() + diff);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            days.push(day);
        }

        return days;
    }

    function switchDay(date) {
        state.selectedDay = date;
        clearAllCells();
        loadData(date);
    }

    function clearAllCells() {
        state.blocks = {};
        renderAllBlocks();
    }

    function init() {
        state.currentWeek = getCurrentWeek();

        injectStyles();
        initializeCells();
        initializeDayDropdown();
        loadData(state.selectedDay);

        const closeBtn = document.getElementById('close-panel');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeActionPanel);
        }

        console.log('Infinite Frontiers initialized (textarea mode)');
    }

    // ========================================
    // NAMESPACE IMPLEMENTATIONS
    // ========================================

    const blockNamespace = {
        expandNow: () => expandNow(),
        getState: () => getCurrentTimeBlock(),
        carve: (params) => carve(params),
        patch: (params) => patchBlock(params),
        post: (params) => postBlock(params),
        delete: () => ({ status: 'pending' })
    };

    const quarterNamespace = {
        expandNow: () => ({ status: 'pending', message: 'Quarterly context coming soon' }),
        shutdown: () => ({ status: 'pending', message: 'Quarterly review coming soon' }),
        openDay: () => ({ status: 'pending', message: 'Quarterly planning coming soon' }),
        getQuarterState: () => ({ status: 'pending', message: 'Quarterly state query coming soon' })
    };

    const yearNamespace = {
        expandNow: () => ({ status: 'pending', message: 'Yearly context coming soon' }),
        shutdown: () => ({ status: 'pending', message: 'Yearly review coming soon' }),
        openDay: () => ({ status: 'pending', message: 'Yearly planning coming soon' }),
        getYearState: () => ({ status: 'pending', message: 'Yearly state query coming soon' })
    };

    // ========================================
    // EXPOSE PUBLIC API
    // ========================================

    window.inf = {
        // Daily (default namespace)
        getCurrentTimeBlock,
        getDayState,
        getState: getDayState,
        expandNow,
        pivot,
        shutdown,
        carve,

        // Namespace hierarchy
        block: blockNamespace,
        week: {},  // Populated by week.js
        quarter: quarterNamespace,
        year: yearNamespace,

        // Utilities
        _state: state,
        _saveData: saveData,
        _loadData: loadData
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
