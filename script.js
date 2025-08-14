// Get our HTML elements from the page
var taskForm = document.getElementById("task-form");
var taskInput = document.getElementById("task-input");
var deadlineInput = document.getElementById("deadline-input");
var priorityInput = document.getElementById("priority-input"); // Get the new priority input
var taskList = document.getElementById("task-list");
var modalContainer = document.getElementById('modal-container');
var modalMessage = document.getElementById('modal-message');
var modalOkButton = document.getElementById('modal-ok-button');
var clearCompletedBtn = document.getElementById('clear-completed-btn');

// Show a custom modal message instead of a native alert
function showModal(message) {
    modalMessage.textContent = message;
    modalContainer.classList.remove('hidden');
}

modalOkButton.addEventListener('click', function() {
    modalContainer.classList.add('hidden');
});

// Get tasks from local storage, or start with an empty array
var tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// A function to save our tasks to local storage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// A function to show all the tasks on the page
function renderTasks() {
    taskList.innerHTML = ""; // Clear the list first
    
    // Create a priority map for sorting
    const priorityMap = { 'High': 1, 'Medium': 2, 'Low': 3 };

    // Sort tasks first by priority, then by deadline date
    tasks.sort((a, b) => {
        // Sort by priority first
        if (priorityMap[a.priority] !== priorityMap[b.priority]) {
            return priorityMap[a.priority] - priorityMap[b.priority];
        }
        // If priorities are the same, sort by deadline
        if (a.deadline && b.deadline) {
            return new Date(a.deadline) - new Date(b.deadline);
        }
        // Push tasks without deadlines to the end
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return 0;
    });

    // Loop through all of our tasks
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];

        // Create a new div for each task
        var taskDiv = document.createElement("div");
        taskDiv.className = `task-item bg-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm transition-all duration-300 ease-in-out`;
        
        // Add priority class for styling
        taskDiv.classList.add(`priority-${task.priority.toLowerCase()}`);
        
        if (task.completed) {
            taskDiv.classList.add("completed");
        }
        
        // A simple reminder for deadlines
        if (task.deadline) {
            const now = new Date();
            const deadlineDate = new Date(task.deadline);
            const diffTime = deadlineDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 1 && diffDays >= 0 && !task.completed) {
                taskDiv.classList.add("reminder");
            }
        }

        // Create the task text element
        var taskTextSpan = document.createElement("span");
        taskTextSpan.className = "text-lg text-gray-800 flex-grow mr-4 task-text";
        taskTextSpan.textContent = task.text;

        // Add deadline text if it exists
        if (task.deadline) {
            var deadlineSpan = document.createElement("span");
            deadlineSpan.className = "text-sm font-medium text-gray-500 ml-2 task-deadline";
            deadlineSpan.textContent = `(Due: ${task.deadline})`;
            taskTextSpan.appendChild(deadlineSpan);
        }
        
        // Create a container for the action buttons
        var actionsDiv = document.createElement("div");
        actionsDiv.className = "flex space-x-2 items-center";

        // Create the priority selector for each task
        var prioritySelect = document.createElement("select");
        prioritySelect.className = "p-1 rounded-md text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";
        prioritySelect.dataset.index = i;
        const priorities = ['High', 'Medium', 'Low'];
        priorities.forEach(p => {
            const option = document.createElement('option');
            option.value = p;
            option.textContent = p;
            if (task.priority === p) {
                option.selected = true;
            }
            prioritySelect.appendChild(option);
        });
        actionsDiv.appendChild(prioritySelect);
        
        // Event listener for priority change
        prioritySelect.addEventListener('change', function(event) {
            var taskIndex = event.currentTarget.dataset.index;
            tasks[taskIndex].priority = event.target.value;
            saveTasks();
            renderTasks();
        });


        // Create the "Complete" button
        var completeBtn = document.createElement("button");
        completeBtn.innerHTML = `<i class="fas fa-check-circle"></i>`;
        completeBtn.className = `p-2 rounded-full transition-colors duration-300 ${task.completed ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-green-500'}`;
        completeBtn.dataset.index = i;
        actionsDiv.appendChild(completeBtn);

        // Create the "Edit" button
        var editBtn = document.createElement("button");
        editBtn.innerHTML = `<i class="fas fa-edit"></i>`;
        editBtn.className = "edit-btn p-2 rounded-full text-gray-400 hover:text-blue-500 transition-colors duration-300";
        editBtn.dataset.index = i;
        actionsDiv.appendChild(editBtn);

        // Create the "Delete" button
        var deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
        deleteBtn.className = "delete-btn p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors duration-300";
        deleteBtn.dataset.index = i;
        actionsDiv.appendChild(deleteBtn);

        // Put all the pieces together inside our task div
        taskDiv.appendChild(taskTextSpan);
        taskDiv.appendChild(actionsDiv);

        // Add the new task div to the list on the page
        taskList.appendChild(taskDiv);

        // Event listeners for the new buttons
        completeBtn.addEventListener("click", function(event) {
            var taskIndex = event.currentTarget.dataset.index;
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks(); // Update the page
        });
        
        editBtn.addEventListener("click", function(event) {
            var taskIndex = event.currentTarget.dataset.index;
            var currentTask = tasks[taskIndex];
            
            // Replace the task text with an input field
            var inputField = document.createElement("input");
            inputField.type = "text";
            inputField.value = currentTask.text;
            inputField.className = "flex-grow p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
            
            taskTextSpan.innerHTML = '';
            taskTextSpan.appendChild(inputField);
            inputField.focus();

            // Change the edit button to a save button
            editBtn.innerHTML = `<i class="fas fa-save"></i>`;
            editBtn.className = "save-btn p-2 rounded-full text-green-500 hover:text-green-600 transition-colors duration-300";

            // Add a new event listener for saving
            editBtn.removeEventListener('click', this); // Remove old listener
            editBtn.addEventListener('click', function saveHandler() {
                currentTask.text = inputField.value;
                saveTasks();
                renderTasks(); // Re-render the tasks
            });
        });
        
        deleteBtn.addEventListener("click", function(event) {
            var taskIndex = event.currentTarget.dataset.index;
            tasks.splice(taskIndex, 1); // Remove the task from the array
            saveTasks();
            renderTasks(); // Update the page
        });
    }
}

// Handle what happens when we submit the form
taskForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Stop the page from refreshing

    var newTaskText = taskInput.value.trim();
    var newDeadline = deadlineInput.value;
    var newPriority = priorityInput.value;

    if (newTaskText) {
        // Add the new task to our tasks array
        tasks.push({ text: newTaskText, completed: false, deadline: newDeadline, priority: newPriority });
        saveTasks();
        renderTasks();
        taskInput.value = ""; // Clear the input box
        deadlineInput.value = "";
        priorityInput.value = "Medium"; // Reset priority to default
    } else {
        showModal("Please write something to do!");
    }
});

// Event listener for the new clear completed button
clearCompletedBtn.addEventListener('click', function() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

// Run this function when the page first loads
renderTasks();
