document.getElementById('transferButton').addEventListener('click', function() {
    transferText();
    moveTextBoxBelowTable();
    markExistingRows(); // Marks rows added before this click
});

document.getElementById('inputBox').addEventListener('input', function() {
    updateTable();
});

document.getElementById('inputBox').addEventListener('keydown', function(event) {
    if (event.key.length === 1) {
        showTableHeaders();
    }
});

function transferText() {
    updateTable();
    document.getElementById('inputBox').value = ''; // Clear the input box after transferring
    
    // Show the image
    let flashImage = document.getElementById('flashImage');
    flashImage.style.display = 'block';
    
    // Hide the image after 100 milliseconds (2 seconds)
    setTimeout(function() {
        flashImage.style.display = 'none';
    }, 100);
}



function updateTable() {
    let inputBox = document.getElementById('inputBox');
    let tableBody = document.getElementById('recipeTable').getElementsByTagName('tbody')[0];
    const lines = inputBox.value.split('\n');
    // Remove only unmarked rows (new input rows)
    Array.from(tableBody.querySelectorAll('tr')).forEach(row => {
        if (!row.classList.contains('saved')) {
            tableBody.removeChild(row);
        }
    });
    lines.forEach((line, index) => {
        if (line.trim() !== '') {
            createRow(tableBody, line);
        }
    });
    addDragHandlers();
}

function createRow(tableBody, line, insertPosition = -1) {
    const row = tableBody.insertRow(insertPosition);
    row.setAttribute('draggable', true);
    row.setAttribute('ondragstart', 'drag(event)');
    const parts = line.split(' '); // Simplified parsing: assumes format "ingredient quantity unit"
    for (let i = 0; i < 3; i++) {
        let cell = row.insertCell();
        cell.innerHTML = parts[i] || '';
        cell.contentEditable = 'true';
    }
    let actionCell = row.insertCell();
    actionCell.innerHTML = '<button onclick="deleteRow(this)">Delete</button> ' +
                           '<button onclick="addRowAbove(this)">Add Row Above</button>';

    actionCell.contentEditable = 'false';
}

function addDragHandlers() {
    let rows = document.querySelectorAll('#recipeTable tbody tr');
    rows.forEach(row => {
        row.addEventListener('dragstart', handleDragStart);
        row.addEventListener('dragover', handleDragOver);
        row.addEventListener('drop', handleDrop);
        row.addEventListener('dragend', handleDragEnd);
    });
}

let dragSrcEl = null;

function handleDragStart(e) {
    dragSrcEl = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary to allow dropping
    }
    e.dataTransfer.dropEffect = 'move';

    // Highlight potential drop location
    const target = e.target.closest('tr');
    if (target) {
        const rect = target.getBoundingClientRect();
        const relY = e.clientY - rect.top;
        if (relY < (rect.height / 2)) {
            target.style.borderTop = '2px solid blue';
            target.style.borderBottom = '';
        } else {
            target.style.borderTop = '';
            target.style.borderBottom = '2px solid blue';
        }
    }
    return false;
}

function handleDrop(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    if (e.stopPropagation) {
        e.stopPropagation(); // Stop some browsers from redirecting.
    }

    // Remove all border styles
    document.querySelectorAll('tr').forEach(row => {
        row.style.borderTop = '';
        row.style.borderBottom = '';
    });

    const target = e.target.closest('tr');
    if (target && dragSrcEl !== target) {
        const rect = target.getBoundingClientRect();
        const relY = e.clientY - rect.top;
        if (relY < (rect.height / 2)) {
            target.parentNode.insertBefore(dragSrcEl, target); // Insert before target
        } else {
            target.parentNode.insertBefore(dragSrcEl, target.nextSibling); // Insert after target
        }
    } else if (!target) {
        // Handle edge case if dropped outside any row, e.g., at the beginning or end of the table
        let tableBody = document.getElementById('recipeTable').getElementsByTagName('tbody')[0];
        if (tableBody) {
            tableBody.appendChild(dragSrcEl);
        }
    }
    return false;
}

function handleDragEnd(e) {
    // Cleanup all border styles
    document.querySelectorAll('tr').forEach(row => {
        row.style.borderTop = '';
        row.style.borderBottom = '';
    });
    this.classList.remove('dragging');
    addDragHandlers(); // Reattach event handlers since innerHTML replacement detaches them
}

function deleteRow(button) {
    let row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function addRowAbove(button) {
    let row = button.parentNode.parentNode;
    let index = row.rowIndex; // Get the current row index
    createRow(row.parentNode, '  ', index - 1); // Use index - 1 to add above
}

function markExistingRows() {
    let tableBody = document.getElementById('recipeTable').getElementsByTagName('tbody')[0];
    Array.from(tableBody.querySelectorAll('tr')).forEach(row => {
        row.classList.add('saved');
    });
}

function moveTextBoxBelowTable() {
    let inputContainer = document.getElementById('inputContainer');
    let recipeTable = document.getElementById('recipeTable');
    recipeTable.parentNode.insertBefore(inputContainer, recipeTable.nextSibling);
}

function showTableHeaders() {
    document.getElementById('recipeTable').classList.remove('hidden');
}
