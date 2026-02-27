// app-bundled.js - Single file version (no ES6 modules)
// Works when opening HTML directly in browser

(function() {
    'use strict';

    const state = {
        selectedDay: new Date(),
        currentWeek: null
    };

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

    function getCurrentTimeSlot() {
        const now = new Date();
        const hour = now.getHours();
        
        const slots = ['09:00am', '10:00am', '11:00am', '12:00pm', 
                      '01:00pm', '02:00pm', '03:00pm', '04:00pm'];
        
        if (hour < 9) return slots[0];
        if (hour >= 16) return slots[slots.length - 1];
        
        const index = hour - 9;
        return slots[index];
    }

    function createTaskItem(text = '', completed = false) {
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
            saveData();
        });
        
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        return li;
    }

    function saveData() {
        console.log('Save triggered');
    }

    function initializeCell(cell) {
        if (cell.dataset.initialized) return;
        cell.dataset.initialized = 'true';
        
        if (cell.classList.contains('locked')) return;
        
        let ul = cell.querySelector('.task-list');
        if (!ul) {
            ul = document.createElement('ul');
            ul.className = 'task-list';
            cell.appendChild(ul);
        }
        
        cell.addEventListener('click', function(e) {
            if (this.classList.contains('locked') || this.classList.contains('carved-block')) return;
            
            if (e.target === this || e.target === ul) {
                let firstTask = ul.querySelector('.task-text');
                if (!firstTask) {
                    ul.appendChild(createTaskItem());
                    firstTask = ul.querySelector('.task-text');
                }
                firstTask.focus();
            }
        });
        
        cell.addEventListener('keydown', function(e) {
            if (this.classList.contains('locked') || this.classList.contains('carved-block')) return;
            
            if (e.key === 'Enter' && e.target.classList.contains('task-text')) {
                e.preventDefault();
                const newTask = createTaskItem();
                ul.appendChild(newTask);
                newTask.querySelector('.task-text').focus();
            }
        });
        
        let saveTimeout;
        cell.addEventListener('input', function() {
            if (this.classList.contains('locked') || this.classList.contains('carved-block')) return;
            
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                saveData();
            }, 1000);
        });
        
        cell.addEventListener('blur', function(e) {
            if (this.classList.contains('locked') || this.classList.contains('carved-block')) return;
            
            setTimeout(() => {
                if (!this.contains(document.activeElement)) {
                    const items = ul.querySelectorAll('li');
                    items.forEach(li => {
                        const textSpan = li.querySelector('.task-text');
                        if (textSpan && textSpan.textContent.trim() === '') {
                            li.remove();
                        }
                    });
                    saveData();
                }
            }, 100);
        }, true);
    }

    function initializeCells() {
        const cells = document.querySelectorAll('.editable-cell');
        cells.forEach(cell => initializeCell(cell));
    }

    function pivot() {
        const table = document.querySelector('#daily-table');
        const thead = table.querySelector('thead tr');
        const tbody = table.querySelector('tbody');
        
        const existingColumns = thead.querySelectorAll('.column-header').length;
        
        if (existingColumns >= 4) {
            alert('Maximum 4 columns reached for today');
            return {
                success: false,
                message: 'Maximum 4 columns reached for today'
            };
        }
        
        const newColumnNumber = existingColumns + 1;
        const columnLabels = ['Plan A', 'Plan B', 'Plan C', 'Plan D'];
        const newColumnLabel = columnLabels[newColumnNumber - 1] || `Column ${newColumnNumber}`;
        
        const newHeader = document.createElement('th');
        newHeader.className = 'column-header';
        newHeader.dataset.column = newColumnNumber;
        newHeader.textContent = newColumnLabel;
        thead.appendChild(newHeader);
        
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const time = row.dataset.time;
            const newCell = document.createElement('td');
            newCell.className = 'editable-cell';
            newCell.dataset.column = newColumnNumber;
            newCell.dataset.time = time;
            
            row.appendChild(newCell);
            initializeCell(newCell);
        });
        
        if (existingColumns > 0) {
            const prevColumn = existingColumns;
            const prevCells = tbody.querySelectorAll(`[data-column="${prevColumn}"]`);
            prevCells.forEach(cell => cell.classList.add('locked'));
        }
        
        console.log(`Added ${newColumnLabel}`);
        return {
            success: true,
            columnNumber: newColumnNumber,
            columnLabel: newColumnLabel,
            message: `Added ${newColumnLabel} - previous column locked`
        };
    }

    function carve(params) {
        if (!params || params.trim() === '') {
            alert('Usage: carve <name> or carve 10am-12pm <name>');
            return { success: false, message: 'No name provided' };
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
            alert('Block name required');
            return { success: false, message: 'Block name required' };
        }

        const headers = document.querySelectorAll('.column-header');
        if (headers.length === 0) {
            alert('No columns available');
            return { success: false, message: 'No columns available' };
        }
        const activeColumn = parseInt(headers[headers.length - 1].dataset.column);

        let affectedCells = [];

        if (!timeRange) {
            const currentTime = getCurrentTimeSlot();
            const cell = document.querySelector(`.editable-cell[data-column="${activeColumn}"][data-time="${currentTime}"]`);
            
            if (!cell) {
                alert('Current time block not found');
                return { success: false, message: 'Current time block not found' };
            }
            
            affectedCells = [cell];
        } else {
            const [startTime, endTime] = timeRange.split('-');
            const allTimes = ['09:00am', '10:00am', '11:00am', '12:00pm', 
                            '01:00pm', '02:00pm', '03:00pm', '04:00pm'];
            
            const startIdx = allTimes.indexOf(startTime);
            const endIdx = allTimes.indexOf(endTime);
            
            if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
                alert('Invalid time range');
                return { success: false, message: 'Invalid time range' };
            }
            
            for (let i = startIdx; i < endIdx; i++) {
                const time = allTimes[i];
                const cell = document.querySelector(`.editable-cell[data-column="${activeColumn}"][data-time="${time}"]`);
                if (cell) affectedCells.push(cell);
            }
        }

        if (affectedCells.length === 0) {
            alert('No cells found to carve');
            return { success: false, message: 'No cells found' };
        }

        affectedCells.forEach((cell, idx) => {
            cell.classList.add('carved-block');
            cell.dataset.blockName = blockName;
            
            if (idx === 0) {
                cell.classList.add('carved-block-start');
                cell.innerHTML = '';
                const label = document.createElement('div');
                label.className = 'carved-block-label';
                label.textContent = blockName;
                cell.appendChild(label);
            } else {
                cell.classList.add('carved-block-continue');
                cell.innerHTML = '';
            }
        });

        if (affectedCells.length > 1) {
            affectedCells[0].rowSpan = affectedCells.length;
            for (let i = 1; i < affectedCells.length; i++) {
                affectedCells[i].style.display = 'none';
            }
        }

        saveData();
        console.log(`Carved "${blockName}" across ${affectedCells.length} time slot(s)`);
        
        return {
            success: true,
            blockName,
            timeSlots: affectedCells.length,
            message: `Carved "${blockName}" across ${affectedCells.length} time slot(s)`
        };
    }

    function expandNow() {
        alert('Expand now - feature coming soon!');
        return { success: true };
    }

    function shutdown() {
        alert('Shutdown - feature coming soon!');
        return { success: true };
    }

    function init() {
        state.currentWeek = getCurrentWeek();
        initializeCells();
        console.log('TimeBlocker initialized');
    }

    window.timeBlocker = {
        pivot,
        carve,
        expandNow,
        shutdown,
        _state: state
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
