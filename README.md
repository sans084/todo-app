# Tasky — Authentication & Todo App

A full-stack todo application built with **Next.js 14** (App Router) and **Strapi v5**.

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 14 (App Router)           |
| Styling    | Tailwind CSS                      |
| Auth State | React Context API                 |
| HTTP       | Axios                             |
| Session    | js-cookie (JWT in Cookie)         |
| Backend    | Strapi v5 (Headless CMS)          |

---

## Project Structure

```
todo-app/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js        # Root layout with AuthProvider
│   │   │   ├── page.js          # Root redirect
│   │   │   ├── globals.css      # Global styles + Tailwind
│   │   │   ├── signin/
│   │   │   │   └── page.js      # Sign In page
│   │   │   ├── signup/
│   │   │   │   └── page.js      # Sign Up page
│   │   │   └── dashboard/
│   │   │       └── page.js      # Protected dashboard
│   │   ├── components/
│   │   │   ├── TodoItem.js      # Individual todo with toggle/delete
│   │   │   └── AddTodo.js       # Add new todo form
│   │   ├── context/
│   │   │   └── AuthContext.js   # User session management
│   │   └── lib/
│   │       └── api.js           # All Strapi API calls
│   ├── middleware.js             # Route protection (Next.js Middleware)
│   ├── .env.local                # Environment variables
│   └── package.json
└── strapi-notes/
    └── todo-controller.js       # Custom Strapi controller (bonus)
```

---

## Part 1: Strapi Backend Setup

### 1. Create a new Strapi project

```bash
npx create-strapi-app@latest backend --quickstart
cd backend
```

This auto-starts Strapi at `http://localhost:1337`. Complete the admin registration.

### 2. Create the Todo Content Type

Go to **Content-Type Builder → + Create new collection type**

- **Display name:** `Todo`

Add these fields:

| Field         | Type      | Options                  |
|---------------|-----------|--------------------------|
| `title`       | Text      | Short text, Required     |
| `isCompleted` | Boolean   | Default: `false`         |
| `user`        | Relation  | See below                |

**Setting up the relation:**
- Field type: **Relation**
- Select: `User (from: users-permissions)` **has many** `Todos`
- This creates a `user` field on Todo pointing to the User model

Click **Save** and wait for Strapi to restart.

### 3. Configure Permissions

Go to **Settings → Users & Permissions → Roles → Authenticated**

Under **Todo**, enable:
- ✅ `create`
- ✅ `delete`
- ✅ `find`
- ✅ `findOne`
- ✅ `update`

Click **Save**.

### 4. (Bonus) Apply the strict backend controller

Copy `strapi-notes/todo-controller.js` to your Strapi project at:

```
backend/src/api/todo/controllers/todo.js
```

This makes the backend automatically assign todos to the authenticated user and prevents any user from reading/editing another user's todos, even with crafted API calls.

---

## Part 2: Next.js Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

The `.env.local` file is already set up:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

Change this if your Strapi runs on a different port.

### 3. Run the development server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Features Implemented

### Authentication
- ✅ **Sign Up** — Username, Email, Password with validation (email format, min 6-char password)
- ✅ **Sign In** — Email/Username + Password, JWT returned from Strapi
- ✅ **JWT Storage** — Stored in a Cookie (recommended for middleware)
- ✅ **Session Persistence** — On page refresh, token is read from cookie and user is re-fetched via `/api/users/me`

### Route Protection (Middleware)
- ✅ `/dashboard` — Redirects to `/signin` if no JWT cookie
- ✅ `/signin`, `/signup` — Redirects to `/dashboard` if already logged in
- ✅ Handled in `middleware.js` at the Next.js edge layer

### Todo Dashboard
- ✅ **Create** — Add new tasks with an empty-check validation
- ✅ **Read** — Todos filtered by `?filters[user][id][$eq]=<userId>` — only current user's tasks
- ✅ **Update** — Click checkbox to toggle Pending ↔ Completed (optimistic UI update)
- ✅ **Delete** — Trash icon removes todo permanently
- ✅ **Filter tabs** — View All / Pending / Completed
- ✅ **Stats bar** — Live count of total, pending, and done tasks
- ✅ **Loading states** — Spinners on all async operations
- ✅ **Error messages** — Server errors displayed on auth forms

### Bonus Challenges
- ✅ **Strict Backend Policy** — Custom Strapi controller enforces user ownership server-side (`strapi-notes/todo-controller.js`)

---

## API Reference

| Action       | Method | Endpoint                                              | Auth |
|-------------|--------|------------------------------------------------------|------|
| Register    | POST   | `/api/auth/local/register`                           | ❌   |
| Login       | POST   | `/api/auth/local`                                    | ❌   |
| Get me      | GET    | `/api/users/me`                                      | ✅   |
| Get todos   | GET    | `/api/todos?filters[user][id][$eq]=<id>&populate=*`  | ✅   |
| Create todo | POST   | `/api/todos`                                         | ✅   |
| Update todo | PUT    | `/api/todos/<id>`                                    | ✅   |
| Delete todo | DELETE | `/api/todos/<id>`                                    | ✅   |
