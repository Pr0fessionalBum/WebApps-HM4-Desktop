import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const validCategories = ['personal', 'professional'] as const
type Category = (typeof validCategories)[number]

function isValidCategory(value: unknown): value is Category {
  return (
    typeof value === 'string' &&
    validCategories.includes(value as Category)
  )
}

export async function GET() {
  const todos = await prisma.todo.findMany({
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })

  return NextResponse.json({ todos })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  const category = body?.category

  if (!title) {
    return NextResponse.json(
      { error: 'Todo title is required.' },
      { status: 400 },
    )
  }

  if (!isValidCategory(category)) {
    return NextResponse.json(
      { error: 'Todo category must be personal or professional.' },
      { status: 400 },
    )
  }

  const todo = await prisma.todo.create({
    data: {
      title,
      category,
      completed: false,
    },
  })

  return NextResponse.json({ todo }, { status: 201 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  if (!isValidCategory(category)) {
    return NextResponse.json(
      { error: 'A valid category query parameter is required.' },
      { status: 400 },
    )
  }

  const result = await prisma.todo.deleteMany({
    where: {
      category,
      completed: true,
    },
  })

  return NextResponse.json({ deletedCount: result.count })
}
