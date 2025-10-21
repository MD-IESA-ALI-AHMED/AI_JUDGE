const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
      req.flash('error', 'All fields are required')
      return res.status(400).json({ ok: false, error: 'Missing fields' })
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] })
    if (existing) {
      req.flash('error', 'Username or email already taken')
      return res.status(409).json({ ok: false, error: 'User exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = new User({ username, email, passwordHash })
    await user.save()

    req.flash('success', 'Registration successful')
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ ok: true, user: { id: user._id, username: user.username, email: user.email }, token })
  } catch (err) {
    console.error(err)
    req.flash('error', 'Server error')
    res.status(500).json({ ok: false, error: 'Server error' })
  }
}

exports.login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body
    if (!usernameOrEmail || !password) {
      req.flash('error', 'All fields are required')
      return res.status(400).json({ ok: false, error: 'Missing fields' })
    }

    const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] })
    if (!user) {
      req.flash('error', 'Invalid credentials')
      return res.status(401).json({ ok: false, error: 'Invalid credentials' })
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      req.flash('error', 'Invalid credentials')
      return res.status(401).json({ ok: false, error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    req.flash('success', 'Logged in')
    res.json({ ok: true, user: { id: user._id, username: user.username, email: user.email }, token })
  } catch (err) {
    console.error(err)
    req.flash('error', 'Server error')
    res.status(500).json({ ok: false, error: 'Server error' })
  }
}
