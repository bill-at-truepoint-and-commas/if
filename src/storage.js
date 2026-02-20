// storage.js - LocalStorage operations

import { getStorageKey } from './utilities.js';
import { getTableRows, getCellContent, setCellContent, findRowByTime, showSaveIndicator } from './dom-helpers.js';

export function saveData(selectedDay, onSave) {
    const tableData = [];
    const rows = getTableRows();
    
    rows.forEach(row => {
        const time = row.dataset.time;
        const cells = row.querySelectorAll('.editable-cell');
        const rowData = { time, cells: [] };
        
        cells.forEach(cell => {
            const col = cell.dataset.col;
            const content = getCellContent(cell);
            rowData.cells.push({ col, content });
        });
        
        tableData.push(rowData);
    });
    
    const storageKey = getStorageKey(selectedDay);
    localStorage.setItem(storageKey, JSON.stringify(tableData));
    
    showSaveIndicator();
}

export function loadData(date, onSave) {
    const storageKey = getStorageKey(date);
    const savedData = localStorage.getItem(storageKey);
    
    if (!savedData) return false;
    
    try {
        const tableData = JSON.parse(savedData);
        
        tableData.forEach(rowData => {
            const row = findRowByTime(rowData.time);
            if (!row) return;
            
            rowData.cells.forEach(cellData => {
                const cell = row.querySelector(`[data-col="${cellData.col}"]`);
                if (cell && cellData.content) {
                    setCellContent(cell, cellData.content, onSave);
                }
            });
        });
        
        return true;
    } catch (e) {
        console.error('Error loading data:', e);
        return false;
    }
}

export function loadColumnNames() {
    const columnMeta = JSON.parse(localStorage.getItem('column_names') || '{}');
    const headers = document.querySelectorAll('#daily-table thead th');
    const colMap = { '1': 1, '2': 2, '3': 3, 'notes': 4 };
    
    Object.keys(columnMeta).forEach(columnId => {
        const headerIndex = colMap[columnId];
        if (headerIndex && headers[headerIndex]) {
            const th = headers[headerIndex];
            th.dataset.columnName = columnMeta[columnId];
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'column-name';
            nameSpan.textContent = columnMeta[columnId];
            nameSpan.style.cssText = 'font-size: 11px; color: #666; font-weight: normal; display: block; margin-top: 4px;';
            th.appendChild(nameSpan);
        }
    });
}
