import TodoApp from '@/components/TodoApp'
import { prisma } from '@/lib/prisma'
import { isCategory, type Task } from '@/lib/todos'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const todos = await prisma.todo.findMany({
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })
  const tasks: Task[] = todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    category: isCategory(todo.category) ? todo.category : 'personal',
    completed: todo.completed,
  }))

  return <TodoApp initialTasks={tasks} />
}
