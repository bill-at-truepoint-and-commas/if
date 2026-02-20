// dom-helpers.js - DOM manipulation and queries

export function getTableRows() {
    return document.querySelectorAll('#daily-table tbody tr');
}

export function findRowByTime(time) {
    const rows = getTableRows();
    for (let row of rows) {
        if (row.dataset.time === time) {
            return row;
        }
    }
    return null;
}

export function getCellContent(cell) {
    const taskList = cell.querySelector('.task-list');
    if (!taskList) return [];
    
    const tasks = [];
    const items = taskList.querySelectorAll('li');
    items.forEach(li => {
        const checkbox = li.querySelector('.task-checkbox');
        const textSpan = li.querySelector('.task-text');
        if (textSpan) {
            tasks.push({
                text: textSpan.textContent.trim(),
                completed: checkbox ? checkbox.checked : false
            });
        }
    });
    
    return tasks;
}

export function createTaskItem(text = '', completed = false, onSave) {
    const li = document.createElement('li');
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = completed;
    
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.contentEditable = 'true';
    textSpan.textContent = text;
    if (completed) textSpan.classList.add('completed');
    
    checkbox.addEventListener('change', function() {
        textSpan.classList.toggle('completed', this.checked);
        if (onSave) onSave();
    });
    
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    return li;
}

export function setCellContent(cell, tasks, onSave) {
    let ul = cell.querySelector('.task-list');
    if (!ul) {
        ul = document.createElement('ul');
        ul.className = 'task-list';
        cell.appendChild(ul);
    } else {
        ul.innerHTML = '';
    }
    
    tasks.forEach(task => {
        ul.appendChild(createTaskItem(task.text, task.completed, onSave));
    });
}

export function showSaveIndicator() {
    const indicator = document.getElementById('save-indicator');
    if (indicator) {
        indicator.classList.add('show');
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }
}

export function clearAllCells() {
    const cells = document.querySelectorAll('.editable-cell');
    cells.forEach(cell => {
        const ul = cell.querySelector('.task-list');
        if (ul) {
            ul.innerHTML = '';
        }
    });
}
