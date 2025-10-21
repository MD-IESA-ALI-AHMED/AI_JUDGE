require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path')

const authRoutes = require('./routes/auth')
const problemsRoutes = require('./routes/problems')
const submissionsRoutes = require('./routes/submissions')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Sessions + flash (note: For production use a store like connect-mongo)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  })
)
app.use(flash())

// expose flash messages to routes if needed
app.use((req, res, next) => {
  res.locals.flash = {
    success: req.flash('success'),
    error: req.flash('error')
  }
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/problems', problemsRoutes)
app.use('/api/submissions', submissionsRoutes)

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'AI_JUDGE backend is up', flash: res.locals.flash })
})

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_judge'
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
  } catch (err) {
    console.error('Failed to start server', err)
    process.exit(1)
  }
}

start()