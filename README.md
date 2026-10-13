# Task Manager API

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

## Security

The `.env` file is ignored by Git and must not be committed. The JWT secret
and MongoDB connection string should remain local.
