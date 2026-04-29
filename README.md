# Todo Desktop

- React project type: Next.js App Router
- Backend: Next.js API routes
- Database: PostgreSQL through Prisma
- Language: TSX
- Styling: vanilla CSS

The app lives in `todo-desktop`.

## Local Setup

From this repository:

```bash
cd todo-desktop
npm install
```

Create `todo-desktop/.env` from `.env.example` and replace `YOUR_PASSWORD` with the password you chose when installing PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/todo_desktop?schema=public"
```

On this Windows machine, PostgreSQL is installed at:

```powershell
C:\Program Files\PostgreSQL\18\bin\psql.exe
```

Create the database if it does not exist:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "CREATE DATABASE todo_desktop;"
```

Then run the Prisma migration and start the app:

```bash
npm run prisma:migrate
npm run dev
```

Open `http://localhost:3000`.

