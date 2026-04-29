# Todo Desktop

Full-stack desktop todo app built with Next.js, React, Prisma, and PostgreSQL.

## Setup

1. Create a PostgreSQL database named `todo_desktop`.
2. Copy `.env.example` to `.env`.
3. Update `DATABASE_URL` in `.env` with your local PostgreSQL username and password.

Example:

```env
DATABASE_URL="postgresql://postgres:my_password@localhost:5432/todo_desktop?schema=public"
```

## Commands

```bash
npm install
npm run prisma:migrate
npm run dev
```

Open `http://localhost:3000` after the dev server starts.

On this machine, `psql` is installed but not added to PATH. Use the full path if needed:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "CREATE DATABASE todo_desktop;"
```

Useful Prisma commands:

```bash
npm run prisma:generate
npm run prisma:studio
```

## How It Works

- `app/page.tsx` loads existing todos on the server with Prisma.
- `components/TodoApp.tsx` reuses the HW4 React todo UI and receives those todos as initial state.
- `app/api/todos/route.ts` creates todos and clears completed todos for a category.
- `app/api/todos/[id]/route.ts` updates completion status and deletes individual todos.
- `prisma/schema.prisma` defines the PostgreSQL-backed `Todo` model.
