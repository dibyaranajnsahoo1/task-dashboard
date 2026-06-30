# Task Dashboard - Task Management App

Task Dashboard is a frontend Kanban-style task management application built with React, TypeScript, Vite, Material UI, Zustand, React Hook Form, Zod, React Router, and Vitest.

The app lets a user create, edit, delete, filter, and move tasks across a three-column board: `To Do`, `In Progress`, and `Done`. It is designed as a clean assignment project that demonstrates component separation, local state persistence, form validation, routing, drag-and-drop behavior, theming, and unit testing.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screens and User Flow](#screens-and-user-flow)
- [Project Structure](#project-structure)
- [State Management](#state-management)
- [Data Model](#data-model)
- [Forms and Validation](#forms-and-validation)
- [Routing](#routing)
- [UI and Theme](#ui-and-theme)
- [Testing](#testing)
- [Setup and Run](#setup-and-run)
- [Available Scripts](#available-scripts)
- [Important Implementation Notes](#important-implementation-notes)

---

## Project Overview

This project is a task dashboard where users can manage project tasks visually. The main page shows a responsive Kanban board with task cards grouped by status.

Each task can contain:

- Title
- Description
- Priority
- Status
- Assignee
- Tags
- Due date
- Created timestamp
- Updated timestamp

The app is frontend-only. There is no backend API in this project. Task data is stored locally using Zustand with persistence, so the user's tasks remain available after refreshing the browser.

---

## Features

### Board Management

- Three task columns: `To Do`, `In Progress`, and `Done`.
- Drag and drop tasks between columns.
- Reorder tasks inside a status column.
- Task count is shown per column.
- Newly created tasks are highlighted on the board after creation.

### Task CRUD

- Create a new task.
- Edit an existing task.
- Delete a task with confirmation.
- Automatically update `updatedAt` when a task changes.
- Automatically generate task IDs using `uuid`.

### Filters

- Search tasks by title or description.
- Filter tasks by priority.
- Filter tasks by assignee.
- Assignee options are derived from the current task list.

### Form Validation

- Task title is required.
- Title has a maximum length.
- Description has a maximum length.
- Due date is required.
- Due date cannot be in the past.
- Priority and status must match the allowed values.

### User Experience

- Responsive layout for desktop, tablet, and mobile.
- Light and dark theme toggle.
- Toast notifications for create, update, and delete actions.
- Clean Material UI interface.
- Reusable common UI components.

---

## Tech Stack

| Area | Technology |
| --- | --- |
| Build tool | Vite 8 |
| Framework | React 19 |
| Language | TypeScript |
| UI library | Material UI 9 |
| Icons | MUI Icons |
| State management | Zustand |
| Persistence | Zustand persist middleware with localStorage |
| Forms | React Hook Form |
| Validation | Zod |
| Routing | React Router 7 |
| Drag and drop | @hello-pangea/dnd |
| Date formatting | date-fns |
| Testing | Vitest, React Testing Library, Jest DOM |
| Linting | ESLint |

---

## Screens and User Flow

### 1. Board Page

Route: `/`

The board page is the main screen of the app. It shows:

- Page title: `Project Tasks`
- `New Task` button
- Task statistics
- Filter bar
- Three Kanban columns
- Task cards inside each column

Each task card displays the task title, priority chip, due date, and an assignee avatar/initials indicator. If an older or imported task does not have an assignee, the card shows an `UA` unassigned avatar fallback.

The board uses `DragDropContext` from `@hello-pangea/dnd`. When a task is dropped into a new column, the `moveTask` action updates its status in the Zustand store.

### 2. Create Task Page

Route: `/create`

This page displays the reusable `TaskForm` component in create mode.

When the form is submitted:

- A new task is created with `addTask`.
- The selected assignee is resolved from the shared assignee list.
- The created task ID is saved temporarily in `sessionStorage`.
- The app navigates back to the board.
- The new task is highlighted on the board.
- A success notification is shown.

### 3. Task Detail/Edit Page

Route: `/task/:id`

This page loads a task by ID from the Zustand store.

Users can:

- View task metadata.
- Edit task fields.
- Change the task assignee.
- Save changes.
- Delete the task.

If a task is not found, the page shows a `Task not found` message with a button to return to the board.

---

## Project Structure

```text
src/
  __tests__/
    FilterBar.test.tsx
    taskStore.test.ts

  assets/
    hero.png
    react.svg
    vite.svg

  components/
    Board/
      BoardColumn.tsx
      BoardView.tsx
      FilterBar.tsx
      TaskStats.tsx

    Layout/
      AppLayout.tsx
      Navbar.tsx

    Task/
      TaskCard.tsx
      TaskForm.tsx

    common/
      AssigneeAvatar.tsx
      ConfirmDialog.tsx
      NotificationProvider.tsx
      PriorityChip.tsx

  data/
    assignees.ts

  pages/
    BoardPage.tsx
    CreateTaskPage.tsx
    TaskDetailPage.tsx

  store/
    notificationStore.ts
    taskStore.ts
    themeStore.ts

  theme/
    ThemeContext.tsx
    index.ts

  types/
    index.ts

  App.tsx
  main.tsx
  index.css
```

---

## State Management

The app uses Zustand instead of React Context for global app state.

### Why Zustand?

- Less boilerplate than Context plus reducer patterns.
- Store logic can be tested without rendering React components.
- Components can subscribe only to the state they need.
- Persistence is simple with Zustand middleware.
- Store actions remain easy to read and maintain.

### Stores

| Store | Purpose |
| --- | --- |
| `taskStore.ts` | Stores tasks and exposes task CRUD plus drag-and-drop movement actions. |
| `themeStore.ts` | Stores light/dark mode and persists it with localStorage. |
| `notificationStore.ts` | Stores global snackbar notification state. |

### Task Store Actions

| Action | Description |
| --- | --- |
| `addTask` | Creates a new task with generated ID and timestamps. |
| `updateTask` | Updates an existing task and refreshes `updatedAt`. |
| `deleteTask` | Removes a task from the store. |
| `moveTask` | Moves a task to a different status and optional index. |

---

## Data Model

The task types are defined in `src/types/index.ts`.

```ts
export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'To Do' | 'In Progress' | 'Done';

export interface Assignee {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee?: Assignee;
  tags?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Forms and Validation

Task create and edit screens both use the same `TaskForm` component.

The form is powered by:

- `react-hook-form` for form state.
- `zod` for schema validation.
- `@hookform/resolvers/zod` to connect Zod with React Hook Form.

Validation rules include:

- `title` is required and limited to 100 characters.
- `description` is optional and limited to 500 characters.
- `priority` must be `Low`, `Medium`, or `High`.
- `status` must be `To Do`, `In Progress`, or `Done`.
- `assigneeId` is required and maps to an assignee from `src/data/assignees.ts`.
- `dueDate` is required.
- `dueDate` cannot be earlier than today.
- `tags` are optional and can be entered through a free-solo autocomplete field.

The form includes an assignee dropdown with avatar initials, and both create and edit flows persist the selected assignee on the task.

---

## Routing

Routes are defined in `src/App.tsx`.

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | `BoardPage` | Shows the Kanban board. |
| `/create` | `CreateTaskPage` | Shows the create task form. |
| `/task/:id` | `TaskDetailPage` | Shows edit/delete screen for a task. |
| `*` | Redirect | Redirects unknown routes back to `/`. |

The app uses `AppLayout` as a shared layout wrapper for the navbar and page content.

---

## UI and Theme

The interface is built with Material UI components and custom theme configuration.

Important UI pieces:

- `Navbar` contains the app title and theme toggle.
- `BoardView` controls board layout, filters, and drag-and-drop.
- `BoardColumn` renders each Kanban column.
- `TaskCard` renders individual task cards with title, priority, due date, and assignee avatar/initials.
- `PriorityChip` displays priority labels consistently.
- `AssigneeAvatar` renders assignee initials/avatar with tooltip and fallback initials support.
- `ConfirmDialog` is used before deleting a task.
- `NotificationProvider` shows global snackbar messages.

The theme mode is stored in `themeStore.ts`, persisted to localStorage, and applied through Material UI's `ThemeProvider`.

---

## Testing

Tests are located in `src/__tests__/`.

| Test file | What it checks |
| --- | --- |
| `taskStore.test.ts` | Add task, delete task, update task, and move task between statuses. |
| `FilterBar.test.tsx` | Search input callback, assignee filter rendering, and priority filter rendering. |

Run tests with:

```bash
npm run test
```

Run tests once without watch mode:

```bash
npm run test -- --run
```

The Vitest setup file imports `@testing-library/jest-dom` and cleans up React Testing Library renders after each test.

---

## Setup and Run

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

The app will run on the Vite dev server, usually:

```text
http://localhost:5173
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Runs TypeScript build and creates a production Vite build. |
| `npm run preview` | Serves the production build locally. |
| `npm run lint` | Runs ESLint across the project. |
| `npm run test` | Runs Vitest in watch mode. |
| `npm run test -- --run` | Runs Vitest once and exits. |

---

## Important Implementation Notes

- The project is frontend-only and uses local browser storage instead of an API.
- Initial mock tasks are defined in `taskStore.ts`.
- Shared assignee options are defined in `src/data/assignees.ts`.
- Tasks and theme preference persist through Zustand's `persist` middleware.
- New task highlighting uses `sessionStorage` to pass the created task ID from the create page back to the board.
- MUI icon imports use direct paths like `@mui/icons-material/AddRounded` instead of the package barrel import. This keeps test startup lighter and avoids opening the entire icon package during Vitest runs.
- `vitest.config.ts` includes dependency handling for MUI and `react-transition-group` so tests run correctly with the current ESM packages.

---

## Summary

TaskMaster demonstrates a complete React task board workflow:

- A responsive Kanban board.
- Drag-and-drop status updates.
- Create, edit, and delete flows.
- Validated forms.
- Local persistent state.
- Light/dark theming.
- Reusable component architecture.
- Focused unit tests.

It is structured to be easy to understand, extend, and present as a frontend assignment project.

---

## AI Usage

**Tools used**:Claude, Codex, Antigravity (Google DeepMind AI coding assistant) — used throughout both Step 1 and Step 2.

### How AI was used

**Step 1 (Frontend)**
- Scaffolded MUI component boilerplate (TaskCard, BoardColumn layouts)
- Generated Zod schema definitions for the form validation
- Helped debug MUI v6 `slotProps` API migration errors (the old `InputProps`/`PaperProps` pattern was deprecated)
- Generated initial unit test structure for Vitest + React Testing Library

**Step 2 (Backend)**
- Scaffolded the Express route and controller structure
- Generated the initial SQLite migration SQL and boilerplate database connection
- Helped write the Supertest integration test structure

---

### One concrete example where AI's suggestion was wrong

When building the `TaskForm`, AI initially suggested using the MUI `Grid` component with `item` and `xs` props — the MUI v5 pattern. This caused TypeScript errors in MUI v6 because `Grid` was restructured. I recognised the issue and replaced the entire layout with a CSS Grid via `Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}`, which is both more reliable and avoids the MUI Grid abstraction entirely. This was a deliberate departure from the AI's output.

Similarly, for the backend, AI initially suggested using `better-sqlite3`. While this is the industry standard for SQLite in Node, it requires a native C++ compile step (`node-gyp`). When testing on a Windows machine without the C++ build tools installed, it completely failed to install. I immediately recognized that this would cause a terrible experience if a reviewer tried to run `npm install` without the correct SDKs. I made the architectural decision to rip out `better-sqlite3` and replace it with `sql.js` (a WASM port of SQLite). This kept the exact same synchronous API but guaranteed zero installation friction for the reviewer. AI did not suggest this—I had to override it to prioritize reviewer experience and cross-platform stability.

---

### Where AI meaningfully accelerated work

**Step 1**: Generating the MUI theme file (`theme/index.ts`) with both light and dark palettes, typography, and component overrides would have taken significant time to write manually. AI produced a solid 100-line starting point in seconds that I then refined with the exact color palette I wanted.

**Step 2**: The Zod validation schemas and the dynamic `SET` clause builder in `updateTask` (partial update pattern) were generated quickly by AI and required only minor adjustments for TypeScript strict-mode compliance.

