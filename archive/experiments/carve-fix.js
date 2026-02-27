// Carve function - names columns (🔁1, 🔁2, 🔁3, notes)
function carve(params) {
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
