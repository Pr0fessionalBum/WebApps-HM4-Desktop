export type Category = 'personal' | 'professional'

export type Task = {
  id: number
  title: string
  category: Category
  completed: boolean
}

const categories: Category[] = ['personal', 'professional']

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && categories.includes(value as Category)
}
