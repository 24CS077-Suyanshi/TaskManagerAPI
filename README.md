# Task Manager API

[![CI Pipeline](https://github.com/24CS077-Suyanshi/TaskManagerAPI/actions/workflows/ci.yml/badge.svg)](https://github.com/24CS077-Suyanshi/TaskManagerAPI/actions/workflows/ci.yml)

Full-stack task management application built with React, Node.js, Express,

MongoDB, and JWT authentication.

## Project structure

- `app.js` - Express server and MongoDB startup
- `models/` - Mongoose models for users and tasks
- `routes/` - authentication and task CRUD routes
- `middleware/` - JWT authentication and task validation
- `task-manager-frontend/` - React frontend
- `postman/` - Postman collections and environments

## Requirements

- Node.js 18 or newer
- MongoDB connection
- npm

## Backend setup

From the repository root:

```bash
npm install
```

Create a `.env` file in the repository root:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
```

Start the backend:

```bash
node app.js
```

The backend runs at `http://localhost:5000`.

## Frontend setup

Open a second terminal:

```bash
cd task-manager-frontend
npm install
npm run dev
```

The frontend normally runs at `http://localhost:5173`.

## API endpoints

### Authentication

- `POST /api/auth/register` - register a user
- `POST /api/auth/login` - log in and receive a JWT
- `GET /api/auth/me` - get the authenticated user's details

### Protected task routes

Send the login token in this header:

```text
Authorization: Bearer <token>
```

- `GET /api/tasks` - list the logged-in user's tasks
- `POST /api/tasks` - create a task
- `PUT /api/tasks/:id` - update a task
- `DELETE /api/tasks/:id` - delete a task

## Full-stack flow

1. Register a user from the React interface.
2. Log in to receive a JWT token.
3. Create, view, update, and delete tasks.
4. Refresh the browser to confirm that tasks remain saved in MongoDB.
5. Use the Postman files in `postman/` to verify the backend independently.

## Docker Setup (Practical 11: Containerization)

Run the entire full-stack application (React Frontend, Express Backend, and MongoDB) with a single command using Docker Compose:

### 1. Build and Start All Containers
```bash
docker compose up -d --build
```

### 2. Service Endpoints
- **Frontend (React)**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **MongoDB**: `localhost:27017` (Internal service name: `mongodb`)

### 3. Verify Running Containers
```bash
docker ps
```

### 4. Stop All Containers
```bash
docker compose down
```

## CI/CD Pipeline (Practical 12: GitHub Actions)

An automated CI pipeline is configured using GitHub Actions (`.github/workflows/ci.yml`):
- Triggers automatically on every `push` and `pull_request` to the `main` branch.
- Checks out the repository, sets up Node.js 20, installs dependencies with `npm install`, and runs automated tests with `npm test`.

### Running Tests Locally
```bash
npm test
```

## AI API Integration (Practical 13: Responsible AI & Graceful Degradation)

An AI-powered task description generator is integrated using external LLM APIs (OpenAI / Gemini) with strict security and graceful failure handling:

### 1. Architecture Flow
`React Frontend ('Generate AI Description' Click)`
  ⬇
`Express Backend (/api/ai/generate-description)`
  ⬇ (API Key kept server-side only in `.env`)
`OpenAI API (GPT-4o-mini)`
  ⬇
`Response parsed ➔ sent to React ➔ editable suggestion shown in task form`

### 2. AI Endpoint
- **URL**: `POST /api/ai/generate-description`
- **Request Body**: `{ "title": "Setup CI/CD Pipeline" }`
- **Response**:
```json
{
  "description": "Configure GitHub Actions workflows to automate testing and deployment for robust code releases.",
  "source": "OpenAI GPT-4o-mini",
  "fallback": false
}
```

### 3. Graceful Degradation & Resilience
- If the OpenAI API key is missing, invalid (e.g. 401 Unauthorized), or times out, the backend catches the error and immediately returns a context-aware heuristic description (`fallback: true`) with status 200.
- The application never crashes and the core task creation workflow is never blocked.

### 4. Rate Limiting & User Control
- **In-memory Rate Limiting**: Max 1 AI request per 10 seconds per IP to avoid quota exhaustion.
- **Editable Suggestions**: AI output is populated into an editable textarea, letting users review or customize before submitting.
- **AI Disclaimer**: Clear UI notice reminding users to review AI-generated suggestions.

## Security

The `.env` file is ignored by Git and must never be committed. The JWT secret, MongoDB connection string, and `OPENAI_API_KEY` remain strictly on the backend server.

