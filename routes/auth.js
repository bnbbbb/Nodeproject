const express = require('express');
const { join, login, logout } = require('../controllers/auth');
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares/auth');
const { verifyToken } = require('../utils/token');
const router = express.Router();

router.post('/join', isNotLoggedIn, join);

router.post('/login', isNotLoggedIn, login);

// router.post('/logout', verifyToken, logout);
router.post('/logout', isLoggedIn, logout);

module.exports = router;
