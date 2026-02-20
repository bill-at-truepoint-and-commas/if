// initialization.js - DOM initialization and event handlers

import { getDaysOfWeek, getDayOfWeek, getCurrentWeek } from './utilities.js';
import { createTaskItem, clearAllCells } from './dom-helpers.js';
import { saveData, loadData, loadColumnNames } from './storage.js';
import { closeActionPanel } from './commands.js';

export function initializeCells(onSave) {
    const cells = document.querySelectorAll('.editable-cell');
    
    cells.forEach(cell => {
        initializeCell(cell, onSave);
    });
}

function initializeCell(cell, onSave) {
    // Skip if already initialized
    if (cell.dataset.initialized) return;
    cell.dataset.initialized = 'true';
    
    // Skip if locked
    if (cell.classList.contains('locked')) return;
    
    let ul = cell.querySelector('.task-list');
    if (!ul) {
        ul = document.createElement('ul');
        ul.className = 'task-list';
        cell.appendChild(ul);
    }
    
    // Click on cell = create/focus first task
    cell.addEventListener('click', function(e) {
        if (this.classList.contains('locked')) return;
        
        if (e.target === this || e.target === ul) {
            let firstTask = ul.querySelector('.task-text');
            if (!firstTask) {
                ul.appendChild(createTaskItem('', false, onSave));
                firstTask = ul.querySelector('.task-text');
            }
            firstTask.focus();
        }
    });
    
    // Enter key = new task
    cell.addEventListener('keydown', function(e) {
        if (this.classList.contains('locked')) return;
        
        if (e.key === 'Enter' && e.target.classList.contains('task-text')) {
            e.preventDefault();
            const newTask = createTaskItem('', false, onSave);
            ul.appendChild(newTask);
            newTask.querySelector('.task-text').focus();
        }
    });
    
    // Auto-save on input
    let saveTimeout;
    cell.addEventListener('input', function() {
        if (this.classList.contains('locked')) return;
        
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            if (onSave) onSave();
        }, 1000);
    });
    
    // Cleanup empty tasks on blur
    cell.addEventListener('blur', function(e) {
        if (this.classList.contains('locked')) return;
        
        setTimeout(() => {
            if (!this.contains(document.activeElement)) {
                const items = ul.querySelectorAll('li');
                items.forEach(li => {
                    const textSpan = li.querySelector('.task-text');
                    if (textSpan && textSpan.textContent.trim() === '') {
                        li.remove();
                    }
                });
                if (onSave) onSave();
            }
        }, 100);
    }, true);
}

// Export this so pivot can use it for new cells
export { initializeCell };

export function initializeDayDropdown(onDayChange) {
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
        if (onDayChange) {
            onDayChange(new Date(this.value));
        }
    });
}

export function initializeApp(state) {
    state.currentWeek = getCurrentWeek();
    
    const onSave = () => saveData(state.selectedDay, onSave);
    const onDayChange = (date) => {
        state.selectedDay = date;
        clearAllCells();
        loadData(date, onSave);
    };
    
    initializeCells(onSave);
    initializeDayDropdown(onDayChange);
    loadData(state.selectedDay, onSave);
    loadColumnNames();
    
    const closeBtn = document.getElementById('close-panel');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeActionPanel);
    }
    
    console.log('Infinite Frontiers initialized');
}
