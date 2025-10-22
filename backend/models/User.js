const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  debates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Debate' }],
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', userSchema)
