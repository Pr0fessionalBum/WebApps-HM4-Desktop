import type { ComponentProps } from 'react'
import { Check, FileX, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import './App.css'

type Category = 'personal' | 'professional'
type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>

type Task = {
  id: number
  title: string
  category: Category
  completed: boolean
}

const initialTasks: Task[] = [
  { id: 1, title: 'Personal Work No. 1', category: 'personal', completed: true },
  { id: 2, title: 'Personal Work No. 2', category: 'personal', completed: false },
  { id: 3, title: 'Personal Work No. 3', category: 'personal', completed: false },
  { id: 4, title: 'Personal Work No. 4', category: 'personal', completed: true },
  { id: 5, title: 'Personal Work No. 5', category: 'personal', completed: false },
  {
    id: 6,
    title: 'Professional Work No. 1',
    category: 'professional',
    completed: false,
  },
  {
    id: 7,
    title: 'Professional Work No. 2',
    category: 'professional',
    completed: true,
  },
]

function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('personal')
  const [newTask, setNewTask] = useState('')
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const visibleTasks = useMemo(
    () => tasks.filter((task) => task.category === activeCategory),
    [activeCategory, tasks],
  )

  const addTask: FormSubmitHandler = (event) => {
    event.preventDefault()

    const title = newTask.trim()
    if (!title) {
      return
    }

    setTasks((currentTasks) => [
      ...currentTasks,
      {
        id: Date.now(),
        title,
        category: activeCategory,
        completed: false,
      },
    ])
    setNewTask('')
  }

  function toggleTask(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  function deleteTask(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    )
  }

  function clearCompleted() {
    setTasks((currentTasks) =>
      currentTasks.filter(
        (task) => task.category !== activeCategory || !task.completed,
      ),
    )
  }

  return (
    <main className="todo-page">
      <TodoHeader />
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <TaskComposer
        newTask={newTask}
        onChange={setNewTask}
        onSubmit={addTask}
      />
      <TaskPanel
        onClearCompleted={clearCompleted}
        onDelete={deleteTask}
        onToggle={toggleTask}
        tasks={visibleTasks}
      />
    </main>
  )
}

function TodoHeader() {
  return (
    <header className="todo-header">
      <span className="logo-text muted">TO</span>
      <span className="logo-text orange">DO</span>
      <span className="logo-check" aria-hidden="true">
        <span></span>
      </span>
    </header>
  )
}

type CategoryTabsProps = {
  activeCategory: Category
  onCategoryChange: (category: Category) => void
}

function CategoryTabs({
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  const tabs: Array<{ label: string; value: Category }> = [
    { label: 'Personal', value: 'personal' },
    { label: 'Professional', value: 'professional' },
  ]

  return (
    <nav className="category-tabs" aria-label="Todo categories">
      {tabs.map((tab) => (
        <button
          className={activeCategory === tab.value ? 'tab active' : 'tab'}
          key={tab.value}
          onClick={() => onCategoryChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

type TaskComposerProps = {
  newTask: string
  onChange: (value: string) => void
  onSubmit: FormSubmitHandler
}

function TaskComposer({ newTask, onChange, onSubmit }: TaskComposerProps) {
  return (
    <form className="task-composer" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="new-task">
        New task
      </label>
      <input
        id="new-task"
        onChange={(event) => onChange(event.target.value)}
        placeholder="What do you need to do?"
        type="text"
        value={newTask}
      />
      <button type="submit">ADD</button>
    </form>
  )
}

type TaskPanelProps = {
  onClearCompleted: () => void
  onDelete: (taskId: number) => void
  onToggle: (taskId: number) => void
  tasks: Task[]
}

function TaskPanel({
  onClearCompleted,
  onDelete,
  onToggle,
  tasks,
}: TaskPanelProps) {
  return (
    <section className="task-panel" aria-label="Task list">
      <div className="task-list">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            onDelete={onDelete}
            onToggle={onToggle}
            task={task}
          />
        ))}
      </div>

      <button className="clear-button" onClick={onClearCompleted} type="button">
        <FileX aria-hidden="true" className="clear-icon" />
        Clear Completed
      </button>
    </section>
  )
}

type TaskRowProps = {
  onDelete: (taskId: number) => void
  onToggle: (taskId: number) => void
  task: Task
}

function TaskRow({ onDelete, onToggle, task }: TaskRowProps) {
  return (
    <article className={task.completed ? 'task-row completed' : 'task-row'}>
      <button
        aria-label={
          task.completed
            ? `Mark ${task.title} incomplete`
            : `Mark ${task.title} complete`
        }
        className="complete-button"
        onClick={() => onToggle(task.id)}
        type="button"
      >
        {task.completed ? (
          <Check aria-hidden="true" className="check-icon" />
        ) : null}
      </button>

      <p>{task.title}</p>

      <button
        aria-label={`Delete ${task.title}`}
        className="delete-button"
        onClick={() => onDelete(task.id)}
        type="button"
      >
        <Trash2 aria-hidden="true" className="trash-icon" />
      </button>
    </article>
  )
}

export default App
