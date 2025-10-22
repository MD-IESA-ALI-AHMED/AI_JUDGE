# AI Debate Judge

A full-stack MERN application that uses AI to judge debates between two sides.

## Features

- User authentication with JWT
- Create and submit debates for AI judgment
- View debate history and results
- Clean, responsive UI with Tailwind CSS
- Framer Motion animations
- Protected routes
- RESTful API with Express
- MongoDB database with Mongoose
- React + Vite frontend

## Prerequisites

- Node.js >= 14
- MongoDB installed and running
- npm or yarn package manager

## Project Structure

```
/
├── backend/               # Express server
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── server.js        # Server entry point
│   └── .env             # Environment variables
│
└── frontend/            # React + Vite frontend
    ├── src/
    │   ├── api/        # API service functions
    │   ├── components/ # Reusable components
    │   ├── pages/      # Page components
    │   ├── App.jsx     # Root component
    │   └── main.jsx    # Entry point
    ├── index.html
    └── .env            # Frontend environment variables
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/MD-IESA-ALI-AHMED/AI_JUDGE.git
cd AI_JUDGE
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create .env files:

Backend (.env):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-debate-judge
JWT_SECRET=your_jwt_secret_here
MODEL_URL=http://your-ai-model-endpoint
```

Frontend (.env):
```
VITE_API_BASE=http://localhost:5000/api
```

## Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the backend server:
```bash
cd backend
npm run dev
```

3. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user info

### Debates
- POST `/api/debates/judge` - Submit a new debate
- GET `/api/debates/history` - Get user's debate history
- GET `/api/debates/:id` - Get specific debate details

## Technologies Used

- **Frontend:**
  - React + Vite
  - React Router
  - Tailwind CSS
  - Framer Motion
  - Axios
  - JWT Authentication

- **Backend:**
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  - JWT
  - bcrypt

## License

MIT

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request
- Implement persistent models and secure judge worker to safely compile/run code in isolation
