const mongoose = require('mongoose');

const debateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  sideA: { type: String, required: true },
  sideB: { type: String, required: true },
  scoreA: { type: Number, required: true },
  scoreB: { type: Number, required: true },
  winner: { type: String, required: true },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Debate', debateSchema);