const express = require('express');
const { join, login, logout } = require('../controllers/auth');
const passport = require('passport');
const {
  isLoggedIn,
  isNotLoggedIn,
  verifyToken,
} = require('../middlewares/auth');
const { refreshAccessToken } = require('../utils/token');
const router = express.Router();

router.post('/join', isNotLoggedIn, join);

router.post('/login', isNotLoggedIn, login);

// router.post('/logout', verifyToken, logout);
router.post('/logout', isLoggedIn, logout);

router.post('/refresh', isLoggedIn, refreshAccessToken);
module.exports = router;
