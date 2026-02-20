// state-queries.js - API functions for querying state

import { getCurrentTimeSlot, getDayOfWeek, getCurrentWeek } from './utilities.js';
import { findRowByTime, getTableRows, getCellContent } from './dom-helpers.js';

export function getCurrentTimeBlock() {
    const time = getCurrentTimeSlot();
    const row = findRowByTime(time);
    
    if (!row) {
        return {
            time,
            content: [],
            cell: null,
            isEmpty: true,
            index: -1
        };
    }
    
    const cells = row.querySelectorAll('.editable-cell');
    const allContent = [];
    
    cells.forEach(cell => {
        const content = getCellContent(cell);
        if (content.length > 0) {
            allContent.push(...content);
        }
    });
    
    const rows = Array.from(getTableRows());
    const index = rows.indexOf(row);
    
    return {
        time,
        content: allContent,
        cell: row,
        isEmpty: allContent.length === 0,
        index
    };
}

export function getDayState(selectedDay) {
    const rows = getTableRows();
    const blocks = [];
    let totalTasks = 0;
    let completedTasks = 0;
    
    rows.forEach(row => {
        const time = row.dataset.time;
        const cells = row.querySelectorAll('.editable-cell');
        const blockContent = [];
        
        cells.forEach(cell => {
            const content = getCellContent(cell);
            if (content.length > 0) {
                blockContent.push(...content);
                totalTasks += content.length;
                completedTasks += content.filter(t => t.completed).length;
            }
        });
        
        blocks.push({
            time,
            content: blockContent,
            isEmpty: blockContent.length === 0
        });
    });
    
    return {
        day: getDayOfWeek(selectedDay),
        week: getCurrentWeek(),
        blocks,
        completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
        totalBlocks: blocks.length,
        totalTasks,
        completedTasks
    };
}
