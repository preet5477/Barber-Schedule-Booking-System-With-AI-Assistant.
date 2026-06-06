const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const { handleAiChat } = require('../services/aiAgent');

router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.json({
        success: false,
        reply: 'Please enter a message.'
      });
    }

    const result = await handleAiChat({
      message,
      userId: req.userId,
      userRole: req.userRole
    });

    if (!result.success && result.statusCode) {
      return res.status(result.statusCode).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('AI ERROR:', error);
    console.error(error.stack);
    return res.status(500).json({ success: false, message: 'AI error' });
  }
});

module.exports = router;
