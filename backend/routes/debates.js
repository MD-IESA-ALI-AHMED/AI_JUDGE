const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Debate = require('../models/Debate');
const User = require('../models/User');
const axios = require('axios');

// Get all debates for the authenticated user
router.get('/history', auth, async (req, res) => {
  try {
    const debates = await Debate.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(debates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Submit a new debate for judging
router.post('/judge', auth, async (req, res) => {
  try {
    const { sideA, sideB } = req.body;

    // Call the AI model API (simulated)
    const response = await axios.post(process.env.MODEL_URL, { sideA, sideB });
    const { scoreA, scoreB, winner, feedback } = response.data;

    // Create a new debate
    const debate = new Debate({
      user: req.user.id,
      title: `Debate ${new Date().toLocaleDateString()}`,
      sideA,
      sideB,
      scoreA,
      scoreB,
      winner,
      feedback
    });

    // Save the debate
    await debate.save();

    // Add the debate to user's debates array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { debates: debate._id } }
    );

    res.json(debate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get a specific debate by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const debate = await Debate.findById(req.params.id);
    if (!debate) {
      return res.status(404).json({ msg: 'Debate not found' });
    }

    // Check if the debate belongs to the authenticated user
    if (debate.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(debate);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Debate not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;