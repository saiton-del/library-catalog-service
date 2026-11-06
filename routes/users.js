const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', requireAuth, (req, res) => {
  const { _id, username, email, role, createdAt, updatedAt } = req.user;
  return res.status(200).json({
    id: _id,
    username,
    email,
    role,
    createdAt,
    updatedAt,
  });
});

module.exports = router;
