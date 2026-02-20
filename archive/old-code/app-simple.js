// SIMPLIFIED: Just make a working task editor first, add complexity later

document.addEventListener('DOMContentLoaded', () => {
    console.log('Simplified TimeBlocker loading...');
    
    // Helper to create a task item
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
        
        checkbox.onchange = () => {
            textSpan.classList.toggle('completed', checkbox.checked);
        };
        
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        return li;
    }
    
    // Initialize all editable cells
    document.querySelectorAll('.editable-cell').forEach(cell => {
        const ul = document.createElement('ul');
        ul.className = 'task-list';
        cell.appendChild(ul);
        
        // Click on cell = create/focus first task
        cell.onclick = (e) => {
            if (e.target === cell || e.target === ul) {
                let firstTask = ul.querySelector('.task-text');
                if (!firstTask) {
                    ul.appendChild(createTaskItem());
                    firstTask = ul.querySelector('.task-text');
                }
                firstTask.focus();
            }
        };
        
        // Enter key = new task
        cell.onkeydown = (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('task-text')) {
                e.preventDefault();
                const newTask = createTaskItem();
                ul.appendChild(newTask);
                newTask.querySelector('.task-text').focus();
            }
        };
    });
    
    console.log('Simplified TimeBlocker ready - click a cell to start');
});
