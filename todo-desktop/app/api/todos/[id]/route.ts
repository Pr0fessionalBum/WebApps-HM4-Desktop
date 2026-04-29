import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function parseTodoId(id: string) {
  const todoId = Number(id)
  return Number.isInteger(todoId) && todoId > 0 ? todoId : null
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const todoId = parseTodoId(id)

  if (!todoId) {
    return NextResponse.json({ error: 'Invalid todo id.' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)

  if (typeof body?.completed !== 'boolean') {
    return NextResponse.json(
      { error: 'Completed must be a boolean value.' },
      { status: 400 },
    )
  }

  try {
    const todo = await prisma.todo.update({
      where: { id: todoId },
      data: { completed: body.completed },
    })

    return NextResponse.json({ todo })
  } catch {
    return NextResponse.json({ error: 'Todo not found.' }, { status: 404 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const todoId = parseTodoId(id)

  if (!todoId) {
    return NextResponse.json({ error: 'Invalid todo id.' }, { status: 400 })
  }

  try {
    await prisma.todo.delete({
      where: { id: todoId },
    })

    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ error: 'Todo not found.' }, { status: 404 })
  }
}
