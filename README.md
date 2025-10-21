AI_JUDGE_APP

Monorepo scaffold for an AI judge application using the MERN stack.

Folders:
- frontend: Vite + React app
- backend: Node + Express API

Quick start (PowerShell):

cd c:\Users\mohdh\OneDrive\Desktop\AI_JUDGE_25\backend; npm install; npm run dev
cd c:\Users\mohdh\OneDrive\Desktop\AI_JUDGE_25\frontend; npm install; npm run dev

Notes:
- Backend runs on port 5000 by default. Set `MONGO_URI` in `backend/.env` to connect a database.
- Frontend expects the backend API at `http://localhost:5000/api`. Override with `VITE_API_BASE` via `frontend/.env`.

Next steps:
- Install dependencies in each folder
- Wire up MongoDB and environment variables
- Implement persistent models and secure judge worker to safely compile/run code in isolation
