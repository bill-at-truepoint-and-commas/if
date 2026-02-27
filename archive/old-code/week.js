// Weekly TimeBlocker Implementation
// Manages weekly role-based planning (worker, coach, team lead)

(function() {
    'use strict';

    // ========================================
    // STATE
    // ========================================
    
    const weekState = {
        selectedWeek: null,
        roles: ['worker', 'coach', 'team lead'],
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    };

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    
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

    function getCurrentDay() {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[new Date().getDay()];
    }

    function getStorageKey(week) {
        return `timeblocking_week_${week}`;
    }

    function getLocationStorageKey(week) {
        return `timeblocking_locations_${week}`;
    }

    // ========================================
    // DOM HELPERS
    // ========================================
    
    function getTableRows() {
        return document.querySelectorAll('#weekly-table tbody tr');
    }

    function getCellContent(cell) {
        const bulletList = cell.querySelector('.bullet-list');
        if (!bulletList) return [];
        
        const items = [];
        const listItems = bulletList.querySelectorAll('li');
        listItems.forEach(li => {
            const text = li.textContent.trim();
            if (text) {
                items.push(text);
            }
        });
        
        return items;
    }

    function setCellContent(cell, items) {
        let ul = cell.querySelector('.bullet-list');
        if (!ul) {
            ul = document.createElement('ul');
            ul.className = 'bullet-list';
            cell.innerHTML = '';
            cell.appendChild(ul);
        } else {
            ul.innerHTML = '';
        }
        
        items.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            ul.appendChild(li);
        });
    }

    // ========================================
    // STORAGE
    // ========================================
    
    function saveWeekData() {
        const weekData = [];
        const rows = getTableRows();
        
        rows.forEach(row => {
            const role = row.dataset.role;
            const cells = row.querySelectorAll('.editable-cell');
            const roleData = { role, days: {} };
            
            cells.forEach(cell => {
                const day = cell.dataset.day;
                const content = getCellContent(cell);
                roleData.days[day] = content;
            });
            
            weekData.push(roleData);
        });
        
        const storageKey = getStorageKey(weekState.selectedWeek);
        localStorage.setItem(storageKey, JSON.stringify(weekData));
        
        showSaveIndicator();
    }

    function loadWeekData(week) {
        const storageKey = getStorageKey(week);
        const savedData = localStorage.getItem(storageKey);
        
        if (!savedData) return false;
        
        try {
            const weekData = JSON.parse(savedData);
            
            weekData.forEach(roleData => {
                const row = document.querySelector(`[data-role="${roleData.role}"]`);
                if (!row) return;
                
                Object.keys(roleData.days).forEach(day => {
                    const cell = row.querySelector(`[data-day="${day}"]`);
                    if (cell && roleData.days[day]) {
                        setCellContent(cell, roleData.days[day]);
                    }
                });
            });
            
            return true;
        } catch (e) {
            console.error('Error loading week data:', e);
            return false;
        }
    }

    function saveLocationPreferences() {
        const locationData = {};
        document.querySelectorAll('.location-selector').forEach(selector => {
            locationData[selector.dataset.day] = selector.value;
        });
        
        const storageKey = getLocationStorageKey(weekState.selectedWeek);
        localStorage.setItem(storageKey, JSON.stringify(locationData));
    }

    function loadLocationPreferences(week) {
        const storageKey = getLocationStorageKey(week);
        const savedData = localStorage.getItem(storageKey);
        
        if (!savedData) return;
        
        try {
            const locationData = JSON.parse(savedData);
            document.querySelectorAll('.location-selector').forEach(selector => {
                const day = selector.dataset.day;
                if (locationData[day]) {
                    selector.value = locationData[day];
                }
            });
        } catch (e) {
            console.error('Error loading location preferences:', e);
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
    
    function getWeekState() {
        const rows = getTableRows();
        const roleData = [];
        let totalItems = 0;
        
        rows.forEach(row => {
            const role = row.dataset.role;
            const cells = row.querySelectorAll('.editable-cell');
            const days = {};
            
            cells.forEach(cell => {
                const day = cell.dataset.day;
                const content = getCellContent(cell);
                days[day] = content;
                totalItems += content.length;
            });
            
            roleData.push({ role, days });
        });
        
        // Get location preferences
        const locations = {};
        document.querySelectorAll('.location-selector').forEach(selector => {
            locations[selector.dataset.day] = selector.value;
        });
        
        return {
            week: weekState.selectedWeek,
            roles: roleData,
            locations,
            totalItems,
            currentDay: getCurrentDay()
        };
    }

    function getCurrentRoleFocus() {
        const currentDay = getCurrentDay();
        const state = getWeekState();
        
        const todayData = [];
        state.roles.forEach(roleData => {
            const dayContent = roleData.days[currentDay] || [];
            if (dayContent.length > 0) {
                todayData.push({
                    role: roleData.role,
                    items: dayContent
                });
            }
        });
        
        return {
            day: currentDay,
            week: state.week,
            location: state.locations[currentDay] || '🏠',
            roles: todayData
        };
    }

    // ========================================
    // API: COMMANDS
    // ========================================
    
    function expandNow() {
        const currentFocus = getCurrentRoleFocus();
        const weekState = getWeekState();
        
        console.log('Weekly expandNow:', {
            today: currentFocus.day,
            location: currentFocus.location,
            roles: currentFocus.roles,
            fullWeek: weekState
        });
        
        // Generate role-specific actions
        const actions = {
            worker: generateWorkerActions(currentFocus),
            coach: generateCoachActions(currentFocus),
            teamLead: generateTeamLeadActions(currentFocus)
        };
        
        return {
            current: currentFocus,
            context: weekState,
            actions,
            expanded: true
        };
    }

    function generateWorkerActions(focus) {
        const workerRole = focus.roles.find(r => r.role === 'worker');
        if (!workerRole || workerRole.items.length === 0) {
            return ['Define key deliverables for today', 'Review sprint goals', 'Block time for focused work'];
        }
        
        return workerRole.items.map(item => `Execute: ${item}`);
    }

    function generateCoachActions(focus) {
        const coachRole = focus.roles.find(r => r.role === 'coach');
        if (!coachRole || coachRole.items.length === 0) {
            return ['Schedule 1-on-1s', 'Review team member progress', 'Identify coaching opportunities'];
        }
        
        return coachRole.items.map(item => `Support: ${item}`);
    }

    function generateTeamLeadActions(focus) {
        const leadRole = focus.roles.find(r => r.role === 'team lead');
        if (!leadRole || leadRole.items.length === 0) {
            return ['Check team blockers', 'Review sprint progress', 'Plan next steps'];
        }
        
        return leadRole.items.map(item => `Lead: ${item}`);
    }

    function shutdown() {
        const weekState = getWeekState();
        const currentDay = getCurrentDay();
        
        // Analyze week completion
        const completed = [];
        const incomplete = [];
        
        weekState.roles.forEach(roleData => {
            Object.keys(roleData.days).forEach(day => {
                const items = roleData.days[day];
                if (items.length > 0) {
                    if (isBeforeToday(day, currentDay)) {
                        completed.push({
                            role: roleData.role,
                            day,
                            items
                        });
                    } else if (day === currentDay) {
                        // Today's items are considered incomplete for end-of-week review
                        incomplete.push({
                            role: roleData.role,
                            day,
                            items
                        });
                    }
                }
            });
        });
        
        const result = {
            week: weekState.week,
            completed,
            incomplete,
            summary: {
                totalRoles: weekState.roles.length,
                completedDays: completed.length,
                incompleteDays: incomplete.length
            }
        };
        
        console.log('Week shutdown:', result);
        alert(`Week complete!\n\nCompleted: ${completed.length} role-days\nIn progress: ${incomplete.length} role-days`);
        
        return result;
    }

    function openDay() {
        const currentFocus = getCurrentRoleFocus();
        const weekState = getWeekState();
        
        // Analyze what's planned for today across all roles
        const suggestions = [];
        
        currentFocus.roles.forEach(roleData => {
            roleData.items.forEach(item => {
                suggestions.push({
                    role: roleData.role,
                    item,
                    action: 'review',
                    reason: `Planned for ${currentFocus.day}`
                });
            });
        });
        
        // Check if there are gaps (days with no items)
        const gaps = [];
        weekState.roles.forEach(roleData => {
            weekState.days.forEach(day => {
                if (!roleData.days[day] || roleData.days[day].length === 0) {
                    gaps.push({
                        role: roleData.role,
                        day
                    });
                }
            });
        });
        
        const result = {
            current: currentFocus,
            suggestions,
            gaps,
            weekOverview: weekState
        };
        
        console.log('Week openDay:', result);
        alert(`Today: ${currentFocus.day}\nLocation: ${currentFocus.location}\nRoles active: ${currentFocus.roles.length}\n\nCheck console for details.`);
        
        return result;
    }

    // Helper to determine if a day is before today
    function isBeforeToday(day, today) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const dayIndex = days.indexOf(day);
        const todayIndex = days.indexOf(today);
        return dayIndex < todayIndex;
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    
    function initializeCells() {
        const cells = document.querySelectorAll('.editable-cell');
        
        cells.forEach(cell => {
            // Initialize with empty bullet list
            if (!cell.querySelector('.bullet-list')) {
                const ul = document.createElement('ul');
                ul.className = 'bullet-list';
                cell.appendChild(ul);
            }
            
            // Handle focus
            cell.addEventListener('focus', function() {
                const ul = this.querySelector('.bullet-list');
                if (ul && ul.children.length === 0) {
                    const li = document.createElement('li');
                    li.innerHTML = '<br>';
                    ul.appendChild(li);
                    
                    setTimeout(() => {
                        const range = document.createRange();
                        const sel = window.getSelection();
                        range.setStart(li, 0);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }, 0);
                }
            });
            
            // Handle Enter key
            cell.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    
                    const ul = this.querySelector('.bullet-list');
                    if (ul) {
                        const newLi = document.createElement('li');
                        newLi.innerHTML = '<br>';
                        ul.appendChild(newLi);
                        
                        setTimeout(() => {
                            const range = document.createRange();
                            const sel = window.getSelection();
                            range.setStart(newLi, 0);
                            range.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }, 0);
                    }
                }
            });
            
            // Auto-save
            let saveTimeout;
            cell.addEventListener('input', function() {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    saveWeekData();
                }, 1000);
            });
            
            // Cleanup empty items on blur
            cell.addEventListener('blur', function() {
                const ul = this.querySelector('.bullet-list');
                if (ul) {
                    const items = ul.querySelectorAll('li');
                    items.forEach(li => {
                        if (li.textContent.trim() === '') {
                            li.remove();
                        }
                    });
                }
                saveWeekData();
            });
        });
    }

    function initializeLocationSelectors() {
        document.querySelectorAll('.location-selector').forEach(selector => {
            selector.addEventListener('change', saveLocationPreferences);
        });
    }

    function init() {
        weekState.selectedWeek = getCurrentWeek();
        
        initializeCells();
        initializeLocationSelectors();
        loadWeekData(weekState.selectedWeek);
        loadLocationPreferences(weekState.selectedWeek);
        
        console.log('Weekly TimeBlocker initialized');
    }

    // ========================================
    // EXPOSE API
    // ========================================
    
    window.timeBlocker = window.timeBlocker || {};
    window.timeBlocker.week = {
        expandNow,
        shutdown,
        openDay,
        getWeekState,
        getCurrentRoleFocus,
        
        // Internal
        _state: weekState,
        _saveData: saveWeekData,
        _loadData: loadWeekData
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
