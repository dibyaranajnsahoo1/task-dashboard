# Task Dashboard API — Backend (Step 2)

A production-minded REST API for task management built with Node.js, TypeScript, Express, and SQLite.

---

## Quick Start

```bash
cd backend
npm install
cp .env.example .env      # then edit JWT_SECRET
npm run dev               # starts on http://localhost:3001
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3001` | Port the server listens on |
| `JWT_SECRET` | **Yes** | — | Secret for signing JWTs. Use a long random string in production. |
| `NODE_ENV` | No | `development` | Set to `test` for in-memory DB during tests |

---

## Running Tests

```bash
npm test
```

Tests use an **in-memory SQLite database** (no cleanup needed). There are **15 meaningful integration tests** across auth and tasks.

---

## API Reference

### Authentication

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/auth/register` | ❌ | Register a new user |
| `POST` | `/auth/login` | ❌ | Login and get JWT |

**Register / Login request body:**
```json
{ "username": "alice", "password": "mypassword" }
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": { "id": 1, "username": "alice" }
}
```

---

### Tasks

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/tasks` | ❌ | List all tasks |
| `GET` | `/tasks?status=Done` | ❌ | Filter by status |
| `GET` | `/tasks?priority=High&sort=due_date&order=asc` | ❌ | Filter + sort |
| `GET` | `/tasks/:id` | ❌ | Get single task |
| `POST` | `/tasks` | ✅ Bearer JWT | Create task |
| `PUT` | `/tasks/:id` | ✅ Bearer JWT | Update task (partial) |
| `DELETE` | `/tasks/:id` | ✅ Bearer JWT | Delete task |

**Query parameters for `GET /tasks`:**

| Param | Values | Description |
|---|---|---|
| `status` | `To Do`, `In Progress`, `Done` | Filter by status |
| `priority` | `Low`, `Medium`, `High` | Filter by priority |
| `sort` | `created_at`, `due_date`, `updated_at` | Sort field (default: `created_at`) |
| `order` | `asc`, `desc` | Sort order (default: `desc`) |

**Create/Update task body:**
```json
{
  "title": "Build REST API",
  "description": "Complete the backend assignment",
  "priority": "High",
  "status": "In Progress",
  "due_date": "2025-12-31",
  "assignee_name": "Alice",
  "assignee_initials": "AL",
  "tags": ["backend", "api"]
}
```

**Protected endpoints** — include header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Error Responses

All error responses follow the same JSON shape:

```json
{
  "error": "Not Found",
  "message": "Task with id 'abc' does not exist."
}
```

| Status | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `204` | Deleted (no body) |
| `400` | Validation error — check `message` field |
| `401` | Missing or invalid JWT |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate username) |
| `500` | Unexpected server error |

---

## Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app (no listen — imported by tests cleanly)
│   ├── index.ts               # Entry point — runs migrations, starts server
│   ├── db/
│   │   ├── database.ts        # SQLite singleton (in-memory for tests)
│   │   └── migrate.ts         # Schema migrations (auto-runs on startup)
│   ├── types/
│   │   └── index.ts           # Shared TypeScript interfaces
│   ├── middleware/
│   │   ├── auth.ts            # JWT verification middleware
│   │   └── errorHandler.ts    # Global error handler
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── task.routes.ts
│   └── controllers/
│       ├── auth.controller.ts # register + login
│       └── task.controller.ts # CRUD + filtering
└── tests/
    ├── auth.test.ts           # 5 auth integration tests
    └── tasks.test.ts          # 10 task integration tests
```

---

## Architecture Decisions

### Why Express over Fastify?
Express has broader ecosystem compatibility and is the most recognisable choice for reviewers. Fastify would be faster but the difference is negligible at this scale.

### Why SQLite via better-sqlite3?
- **No external service** — reviewers don't need to install Postgres
- **Synchronous API** — `better-sqlite3` is synchronous by design, which makes the code simpler and eliminates async/await complexity in database calls without sacrificing correctness
- **Production-ready** — SQLite handles read-heavy workloads at significant scale (used in production by many products)

### Why Zod for validation?
Zod provides TypeScript-first schema validation with excellent error messages. It infers types automatically, so the validated request body is already correctly typed — no manual casting.

### JWT Scope
Tokens contain only `{ userId, username }` — the minimum needed to identify the user. No roles, permissions, or other data that would create stale-token security issues.

### Password Hashing
bcrypt with 10 salt rounds. This is the industry standard — argon2 would also be acceptable but bcrypt is more universally available and well-understood.
