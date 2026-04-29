'use client'

import type { ComponentProps } from 'react'
import type { Category, Task } from '@/lib/todos'
import { Check, FileX, Trash2 } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'

type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>

type TodoAppProps = {
  initialTasks: Task[]
}

async function parseTodoResponse(response: Response) {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error ?? 'The todo request failed.')
  }

  return data
}

export default function TodoApp({ initialTasks }: TodoAppProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('personal')
  const [newTask, setNewTask] = useState('')
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

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

    setError('')
    startTransition(() => {
      void (async () => {
        try {
          const data = await parseTodoResponse(
            await fetch('/api/todos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, category: activeCategory }),
            }),
          )

          setTasks((currentTasks) => [...currentTasks, data.todo])
          setNewTask('')
        } catch (requestError) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not add that todo.',
          )
        }
      })()
    })
  }

  function toggleTask(taskId: number) {
    const currentTask = tasks.find((task) => task.id === taskId)
    if (!currentTask) {
      return
    }

    setError('')
    startTransition(() => {
      void (async () => {
        try {
          const data = await parseTodoResponse(
            await fetch(`/api/todos/${taskId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ completed: !currentTask.completed }),
            }),
          )

          setTasks((currentTasks) =>
            currentTasks.map((task) => (task.id === taskId ? data.todo : task)),
          )
        } catch (requestError) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not update that todo.',
          )
        }
      })()
    })
  }

  function deleteTask(taskId: number) {
    setError('')
    startTransition(() => {
      void (async () => {
        try {
          await parseTodoResponse(
            await fetch(`/api/todos/${taskId}`, { method: 'DELETE' }),
          )

          setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== taskId),
          )
        } catch (requestError) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not delete that todo.',
          )
        }
      })()
    })
  }

  function clearCompleted() {
    setError('')
    startTransition(() => {
      void (async () => {
        try {
          await parseTodoResponse(
            await fetch(`/api/todos?category=${activeCategory}`, {
              method: 'DELETE',
            }),
          )

          setTasks((currentTasks) =>
            currentTasks.filter(
              (task) => task.category !== activeCategory || !task.completed,
            ),
          )
        } catch (requestError) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Could not clear completed todos.',
          )
        }
      })()
    })
  }

  return (
    <main className="todo-page">
      <TodoHeader />
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <TaskComposer
        disabled={isPending}
        newTask={newTask}
        onChange={setNewTask}
        onSubmit={addTask}
      />
      <TaskPanel
        disabled={isPending}
        onClearCompleted={clearCompleted}
        onDelete={deleteTask}
        onToggle={toggleTask}
        tasks={visibleTasks}
      />
      <p aria-live="polite" className="todo-error">
        {error}
      </p>
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
  disabled: boolean
  newTask: string
  onChange: (value: string) => void
  onSubmit: FormSubmitHandler
}

function TaskComposer({
  disabled,
  newTask,
  onChange,
  onSubmit,
}: TaskComposerProps) {
  return (
    <form className="task-composer" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="new-task">
        New task
      </label>
      <input
        disabled={disabled}
        id="new-task"
        onChange={(event) => onChange(event.target.value)}
        placeholder="What do you need to do?"
        type="text"
        value={newTask}
      />
      <button disabled={disabled} type="submit">
        ADD
      </button>
    </form>
  )
}

type TaskPanelProps = {
  disabled: boolean
  onClearCompleted: () => void
  onDelete: (taskId: number) => void
  onToggle: (taskId: number) => void
  tasks: Task[]
}

function TaskPanel({
  disabled,
  onClearCompleted,
  onDelete,
  onToggle,
  tasks,
}: TaskPanelProps) {
  return (
    <section className="task-panel" aria-label="Task list">
      <div className="task-list">
        {tasks.length === 0 ? <p className="task-empty">No tasks yet.</p> : null}
        {tasks.map((task) => (
          <TaskRow
            disabled={disabled}
            key={task.id}
            onDelete={onDelete}
            onToggle={onToggle}
            task={task}
          />
        ))}
      </div>

      <button
        className="clear-button"
        disabled={disabled}
        onClick={onClearCompleted}
        type="button"
      >
        <FileX aria-hidden="true" className="clear-icon" />
        Clear Completed
      </button>
    </section>
  )
}

type TaskRowProps = {
  disabled: boolean
  onDelete: (taskId: number) => void
  onToggle: (taskId: number) => void
  task: Task
}

function TaskRow({ disabled, onDelete, onToggle, task }: TaskRowProps) {
  return (
    <article className={task.completed ? 'task-row completed' : 'task-row'}>
      <button
        aria-label={
          task.completed
            ? `Mark ${task.title} incomplete`
            : `Mark ${task.title} complete`
        }
        className="complete-button"
        disabled={disabled}
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
        disabled={disabled}
        onClick={() => onDelete(task.id)}
        type="button"
      >
        <Trash2 aria-hidden="true" className="trash-icon" />
      </button>
    </article>
  )
}
