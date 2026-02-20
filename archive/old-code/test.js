// Simple test to see if anything is loading
console.log('Testing if JavaScript is loading...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    console.log('Found cells:', document.querySelectorAll('.editable-cell').length);
    console.log('window.timeBlocker exists?', !!window.timeBlocker);
    
    // Add click handler directly
    document.querySelectorAll('.editable-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            console.log('Cell clicked!');
            alert('Cell was clicked!');
        });
    });
});
