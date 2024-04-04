// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId"));

//defining inputs for later use
const taskNameInput = $('#task')
const taskDateInput = $('#datepicker')
const taskDescInput = $('#description')

function storedTasks() {
    let taskList = JSON.parse(localStorage.getItem('tasks'));

    if (!taskList) {
        taskList = [];
    }
    console.log(taskList)
    return taskList
}
// Todo: create a function to generate a unique task id
//takes the current time and date to make a unique id 
function generateTaskId() {
    const taskId = dayjs().unix()
    return taskId
}
// Todo: create a function to create a task card
function createTaskCard(task) {

    //defining elements and adding class for task cards
    const taskCard = $('<div>')
        .addClass('card draggable')
        .attr('data-task-id', task.id)
    const cardName = $('<div>')
        .addClass('card-header h4')
        .text(task.taskName)
    const cardBody = $('<div>')
        .addClass('card-body')
    const cardDescr = $('<p>')
        .addClass('card-text')
        .text(task.description)
    const cardDue = $('<p>')
        .addClass('card-text')
        .text(task.dueDate)
    const cardDelete = $('<button>')
        .addClass('btn btn-danger delete')
        .text('delete')
        .attr('data-task-id', task.id)
    cardDelete.on('click', handleDeleteTask);

    //changing colors on cards depending on what column its in
    if (task.dueDate && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');
        if (now.isSame(taskDueDate, 'day')) {
            taskCard.addClass('bg-warning text-white');
        } else if (now.isAfter(taskDueDate)) {
            taskCard.addClass('bg-danger text-white');
            cardDelete.addClass('border-light');
        }
    }

    //attaching everything
    cardBody.append(cardDescr, cardDue, cardDelete);
    taskCard.append(cardName, cardBody)

    return taskCard
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    const taskList = storedTasks()

    // getting project card lanes
    const todo = $('#todo-cards')
    const inprog = $('#in-progress-cards')
    const done = $('#done-cards')

    //goes thru all the tasks and renders them in the lane
    for (let task of taskList) {
        if (task.status === 'to-do') {
            todo.append(createTaskCard(task))
        } else if (task.status === 'in-progress') {
            inprog.append(createTaskCard(task))
        } else if (task.status === 'done') {
            done.append(createTaskCard(task))
        }
    }
    
    //makes anything with class draggable actually draggable with jquery ui
    // this is done now because nothing is draggable when the page immediately loads
    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        helper: function (e) {
            const original = $(e.target).hasClass('ui-draggable')
                ? $(e.target)
                : $(e.target).closest('.ui-draggable');
            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    });
}



// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault()

    const taskName = taskNameInput.val()
    const taskDate = taskDateInput.val()
    const taskDesc = taskDescInput.val()

    const newTask = {
        taskId: generateTaskId(),
        taskName: taskName,
        dueDate: taskDate,
        description: taskDesc,
        status: 'to-do'
    }

    //adding newTask to the taskList array
    let taskList = storedTasks()
    taskList.push(newTask)

    //adding it to the task list in local storage
    localStorage.setItem('tasks', JSON.stringify(taskList))

    renderTaskList()
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(this).attr('data-task-id');
    const taskList = storedTasks();

    taskList.forEach((task) => {
        if (task.id === taskId) {
            taskList.splice(taskList.indexOf(task), 1)
        }
    }) 

    localStorage.setItem('task', JSON.stringify(taskList))
    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskList = storedTasks()
    const taskId = ui.draggable[0].dataset.projectId;
    const newStatus = event.target.id;

    for (let task of taskList) {
        if (task.id === taskId) {
            task.status = newStatus
        }
    }

    console.log('drop')
    localStorage.setItem('task', JSON.stringify(taskList));
    renderTaskList()
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {

    // on load renders lists
    renderTaskList()
    
    //enables jqueryui's datepicker and droppable
    $(function () {
        $("#datepicker").datepicker({
            changeMonth: true,
            changeYear: true,
        });
    })
    
    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
      });
    

    $('form').on('submit', handleAddTask)
    $('').on('click', handleDeleteTask)

});
