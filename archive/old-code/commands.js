// commands.js - API command functions (pivot, carve, expand, shutdown)

import { getCurrentTimeSlot, getDayOfWeek, getStorageKey } from './utilities.js';
import { getCurrentTimeBlock, getDayState } from './state-queries.js';
import { getCellContent, setCellContent } from './dom-helpers.js';
import { initializeCell } from './initialization.js';

export function pivot(onSave) {
    const table = document.querySelector('#daily-table');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    // Count existing columns (exclude time column)
    const existingColumns = thead.querySelectorAll('.column-header').length;
    
    if (existingColumns >= 4) {
        return {
            success: false,
            message: 'Maximum 4 columns reached for today'
        };
    }
    
    const newColumnNumber = existingColumns + 1;
    const columnLabels = ['Plan A', 'Plan B', 'Plan C', 'Plan D'];
    const newColumnLabel = columnLabels[newColumnNumber - 1] || `Column ${newColumnNumber}`;
    
    // Add header
    const newHeader = document.createElement('th');
    newHeader.className = 'column-header';
    newHeader.dataset.column = newColumnNumber;
    newHeader.textContent = newColumnLabel;
    thead.appendChild(newHeader);
    
    // Add cells to each row
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const time = row.dataset.time;
        const newCell = document.createElement('td');
        newCell.className = 'editable-cell';
        newCell.dataset.column = newColumnNumber;
        newCell.dataset.time = time;
        
        row.appendChild(newCell);
        
        // Initialize the new cell with event handlers
        initializeCell(newCell, onSave);
    });
    
    // Mark previous column as locked
    if (existingColumns > 0) {
        const prevColumn = existingColumns;
        const prevCells = tbody.querySelectorAll(`[data-column="${prevColumn}"]`);
        prevCells.forEach(cell => cell.classList.add('locked'));
    }
    
    if (onSave) onSave();
    
    return {
        success: true,
        columnNumber: newColumnNumber,
        columnLabel: newColumnLabel,
        message: `Added ${newColumnLabel} - previous column locked`
    };
}

export function carve(params) {
    if (!params || params.trim() === '') {
        return {
            success: false,
            message: 'No name provided. Usage: carve <name> or carve col-1 <name>'
        };
    }

    const parts = params.trim().split(/\s+/);
    let columnId = null;
    let columnName = '';

    // Check if first part specifies a column (col-1, col-2, col-3, col-notes)
    if (parts[0].match(/^col-(1|2|3|notes)$/)) {
        columnId = parts[0].replace('col-', '');
        columnName = parts.slice(1).join(' ');
    } else {
        // Default: name first unnamed column
        columnName = params.trim();
    }

    if (!columnName) {
        return {
            success: false,
            message: 'Column name required'
        };
    }

    // If no column specified, find first unnamed column
    if (!columnId) {
        const headers = document.querySelectorAll('#daily-table thead th');
        const colMap = ['1', '2', '3', 'notes'];
        
        for (let i = 1; i < headers.length; i++) {
            const th = headers[i];
            if (!th.dataset.columnName) {
                columnId = colMap[i - 1];
                break;
            }
        }
    }

    if (!columnId) {
        return {
            success: false,
            message: 'All columns already named'
        };
    }

    // Find the header for this column
    const headers = document.querySelectorAll('#daily-table thead th');
    let targetHeader = null;
    const colMap = { '1': 1, '2': 2, '3': 3, 'notes': 4 };
    const headerIndex = colMap[columnId];
    
    if (headerIndex && headers[headerIndex]) {
        targetHeader = headers[headerIndex];
    }

    if (!targetHeader) {
        return {
            success: false,
            message: `Column ${columnId} not found`
        };
    }

    // Update header with name
    targetHeader.dataset.columnName = columnName;
    
    // Clear old name if exists
    const oldName = targetHeader.querySelector('.column-name');
    if (oldName) oldName.remove();
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'column-name';
    nameSpan.textContent = columnName;
    nameSpan.style.cssText = 'font-size: 11px; color: #666; font-weight: normal; display: block; margin-top: 4px;';
    targetHeader.appendChild(nameSpan);

    // Save column metadata
    const columnMeta = JSON.parse(localStorage.getItem('column_names') || '{}');
    columnMeta[columnId] = columnName;
    localStorage.setItem('column_names', JSON.stringify(columnMeta));

    return {
        success: true,
        columnId,
        columnName,
        message: `Column ${columnId} named "${columnName}"`
    };
}

export function expandNow(selectedDay) {
    const currentBlock = getCurrentTimeBlock();
    
    if (currentBlock.cell) {
        const cells = currentBlock.cell.querySelectorAll('.editable-cell');
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

export function closeActionPanel() {
    const panel = document.getElementById('action-panel');
    if (panel) {
        panel.classList.add('hidden');
    }
    
    document.querySelectorAll('.current-time').forEach(cell => {
        cell.classList.remove('current-time');
    });
}

export function shutdown(selectedDay) {
    const dayState = getDayState(selectedDay);
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
        const tomorrow = new Date(selectedDay);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const tomorrowKey = getStorageKey(tomorrow);
        const movedTasks = movedToTomorrow.map(m => ({
            text: m.task,
            completed: false,
            movedFrom: `${getDayOfWeek(selectedDay)}-${m.originalTime}`
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
