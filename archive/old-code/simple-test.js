// Minimal test - just make cells editable
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const cells = document.querySelectorAll('.editable-cell');
        
        cells.forEach(cell => {
            // Make the cell itself contenteditable
            cell.contentEditable = 'true';
            
            // Simple placeholder
            if (cell.textContent.trim() === '') {
                cell.innerHTML = 'Click to edit...';
            }
            
            // Clear placeholder on focus
            cell.addEventListener('focus', function() {
                if (this.textContent === 'Click to edit...') {
                    this.textContent = '';
                }
            });
        });
        
        console.log('Simple editable cells initialized');
    });
})();
