require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const debatesRoutes = require('./routes/debates');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/debates', debatesRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'AI Debate Judge API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

async function start() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-debate-judge';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
  } catch (err) {
    console.error('Failed to start server', err)
    process.exit(1)
  }
}

start()