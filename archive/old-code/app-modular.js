// app.js - Main entry point (uses ES6 modules)

import { saveData, loadData } from './storage.js';
import { getCurrentTimeBlock, getDayState } from './state-queries.js';
import { pivot, carve, expandNow, shutdown } from './commands.js';
import { initializeApp } from './initialization.js';
import { createBlockNamespace, createQuarterNamespace, createYearNamespace } from './namespaces.js';

(function() {
    'use strict';

    // Application state
    const state = {
        selectedDay: new Date(),
        currentWeek: null
    };

    // Create save function that closes over state
    const onSave = () => saveData(state.selectedDay, onSave);

    // Expose public API
    window.timeBlocker = {
        // Daily (default namespace)
        getCurrentTimeBlock,
        getDayState: () => getDayState(state.selectedDay),
        getState: () => getDayState(state.selectedDay),
        expandNow: () => expandNow(state.selectedDay),
        pivot: () => pivot(onSave),
        shutdown: () => shutdown(state.selectedDay),
        carve,
        
        // Namespace hierarchy
        block: createBlockNamespace(state, onSave),
        week: {},  // Populated by week.js
        quarter: createQuarterNamespace(),
        year: createYearNamespace(),
        
        // Utilities
        _state: state,
        _saveData: onSave,
        _loadData: (date) => loadData(date, onSave)
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initializeApp(state));
    } else {
        initializeApp(state);
    }

})();
