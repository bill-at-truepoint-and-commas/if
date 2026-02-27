// NEW CARVE FUNCTION - Replace in app-bundled.js

function carve(params) {
    if (!params || params.trim() === '') {
        alert('Usage: carve <name> or carve 10am-12pm <name>');
        return { success: false, message: 'No name provided' };
    }

    const parts = params.trim().split(/\s+/);
    let timeRange = null;
    let blockName = '';

    // Check if first part is a time range like "10am-12pm"
    if (parts[0].match(/^\d{1,2}(am|pm)-\d{1,2}(am|pm)$/)) {
        timeRange = parts[0];
        blockName = parts.slice(1).join(' ');
    } else {
        // No time range, carve current time slot
        blockName = params.trim();
    }

    if (!blockName) {
        alert('Block name required');
        return { success: false, message: 'Block name required' };
    }

    // Get current active column (rightmost non-locked)
    const headers = document.querySelectorAll('.column-header');
    if (headers.length === 0) {
        alert('No columns available');
        return { success: false, message: 'No columns available' };
    }
    const activeColumn = parseInt(headers[headers.length - 1].dataset.column);

    let affectedCells = [];

    if (!timeRange) {
        // Carve current time block
        const currentTime = getCurrentTimeSlot();
        const cell = document.querySelector(`.editable-cell[data-column="${activeColumn}"][data-time="${currentTime}"]`);
        
        if (!cell) {
            alert('Current time block not found');
            return { success: false, message: 'Current time block not found' };
        }
        
        affectedCells = [cell];
    } else {
        // Parse time range and find cells
        const [startTime, endTime] = timeRange.split('-');
        const allTimes = ['09:00am', '10:00am', '11:00am', '12:00pm', 
                        '01:00pm', '02:00pm', '03:00pm', '04:00pm'];
        
        const startIdx = allTimes.indexOf(startTime);
        const endIdx = allTimes.indexOf(endTime);
        
        if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
            alert('Invalid time range');
            return { success: false, message: 'Invalid time range' };
        }
        
        // Get all cells in range
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

    // Apply carved block styling
    affectedCells.forEach((cell, idx) => {
        cell.classList.add('carved-block');
        cell.dataset.blockName = blockName;
        
        if (idx === 0) {
            // First cell gets the label
            cell.classList.add('carved-block-start');
            
            // Clear existing content and add block label
            cell.innerHTML = '';
            const label = document.createElement('div');
            label.className = 'carved-block-label';
            label.textContent = blockName;
            cell.appendChild(label);
        } else {
            // Other cells are part of the block but hidden
            cell.classList.add('carved-block-continue');
            cell.innerHTML = '';
        }
    });

    // If multi-row, set rowspan on first cell
    if (affectedCells.length > 1) {
        affectedCells[0].rowSpan = affectedCells.length;
        // Hide continuation cells
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
