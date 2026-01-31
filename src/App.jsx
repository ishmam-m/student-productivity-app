import './App.css'
import {useEffect, useState} from "react";


function TaskInput( { tasks, setTasks } ) {
    const [inputText, setInputText] = useState("")

    function addTask() {
        if (inputText === "") return

        setTasks([...tasks, {
            id: crypto.randomUUID(),
            text: inputText,
            completed: false
        }])

        setInputText("")
    }

    return (
        <>
            <input
                placeholder="Enter task here"
                onChange={event => setInputText(event.target.value)}
                value={inputText}
            />
            <button onClick={addTask}>Add Task</button>
        </>
    )
}

function Task({ task, onToggle, onEdit, onDelete }) {

    const [isEditing, setIsEditing] = useState(false);
    const [inputText, setInputText] = useState("");

    function openEditModal() {
        setIsEditing(true)
        setInputText(task.text)
    }

    function handleSave() {
        if (inputText.trim() === "") return
        onEdit(task.id, inputText)
        setIsEditing(false)
    }

    function handleClose() {
        setInputText(task.text)
        setIsEditing(false)
    }

    return (
        <li className="task-item">
            <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggle(task.id)}
            />

            {" "} {task.text} {" "}

            <button onClick={openEditModal}>Edit</button>
            <button onClick={() => onDelete(task.id)}>Delete</button>

            {isEditing && (
                <EditModal
                    onSave={handleSave}
                    onClose={handleClose}
                    onChange={setInputText}
                    value={inputText}
                />
            )}
        </li>
    )
}

function Tasks({ tasks, setTasks }) {

    function toggleTask(id) {
        setTasks(prev =>
            prev.map(t =>
                t.id === id ? {...t, completed: !t.completed} : t
            )
        )
    }

    function editTask(id, inputText) {
        setTasks(prev =>
            prev.map(t =>
                t.id === id ? {...t, text: inputText} : t
            )
        )
    }

    function deleteTask(id) {
        setTasks(prev => prev.filter(t => t.id !== id))
    }

    return (
        <div className="task-list">
            <ol>
                {tasks.map((task) => {
                    return (
                        <Task
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onEdit={editTask}
                            onDelete={deleteTask}
                        />
                    )
                })}
            </ol>
        </div>
    )
}

function EditModal({ onSave, onChange, onClose, value}) {
    return (
        <div className="modal-backdrop">
            <div className="edit-modal">
                <h2>Edit Task</h2>

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="Enter task here"
                />

                <div style={{ marginTop: 12 }}>
                    <button onClick={onSave} style={{marginRight: 12}}>Save</button>{" "}
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

function FilterModal({ value, onChange, onClose }) {
    return (
        <div className="modal-backdrop">
            <div className="filter-modal">
                <h2>Filter Tasks</h2>

                <div className="filter-options">
                    <label>
                        <input
                            type="radio"
                            name="filter"
                            value="All"
                            checked={value === "All"}
                            onChange={(e) => onChange(e.target.value)}
                        />
                        All Tasks
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="filter"
                            value="Completed"
                            checked={value === "Completed"}
                            onChange={(e) => onChange(e.target.value)}
                        />
                        Completed
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="filter"
                            value="Remaining"
                            checked={value === "Remaining"}
                            onChange={(e) => onChange(e.target.value)}
                        />
                        Remaining
                    </label>
                </div>

                <div>
                    <button onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
}


function clearCompleted(setTasks, totalCompleted, completed) {
    localStorage.setItem("totalCompleted", JSON.stringify(totalCompleted + completed))
    setTasks(prev => prev.filter(t => !t.completed))
}

function App() {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem("tasks")
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks))
    }, [tasks])

    const [filter, setFilter] = useState("All")
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    const filteredTasks = tasks.filter(t => {
        if (filter === "Completed") return t.completed
        if (filter === "Remaining") return !t.completed
        return true
    })

    const total = tasks.length
    const completed = tasks.filter(t => t.completed).length
    const remaining = total - completed

    const saved = localStorage.getItem("totalCompleted")
    const totalCompleted = saved ? JSON.parse(saved) : 0

    return (
            <div className="app">
                <h1 className="title">Student Productivity App</h1>

                <div>
                    <p>Total Tasks: {total}</p>
                    <p>Tasks Completed: {completed}</p>
                    <p>Tasks Remaining: {remaining}</p>
                    <p>All Time Tasks Completed: {totalCompleted + completed}</p>
                </div>

                <div className="task-input-div">
                    <TaskInput
                        tasks={tasks}
                        setTasks={setTasks}
                    />
                    <button onClick={() => setIsFilterOpen(true)}>Filter: {filter}</button>
                </div>

                {isFilterOpen && (
                    <FilterModal
                        value={filter}
                        onChange={setFilter}
                        onClose={() => setIsFilterOpen(false)}
                    />
                )}

                <Tasks
                    tasks={filteredTasks}
                    setTasks={setTasks}
                />

                {(filter === "All" || filter === "Completed") && (
                    <button
                        className="clear-btn"
                        onClick={() => clearCompleted(setTasks, totalCompleted, completed)}
                    >
                        Clear Completed
                    </button>
                )}
            </div>
  )
}

export default App
