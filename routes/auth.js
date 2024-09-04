const express = require('express');
const { join, login, logout } = require('../controllers/auth');
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares/auth');
const router = express.Router();

router.post('/join', isNotLoggedIn, join);

router.post('/login', isNotLoggedIn, login);

router.post('/logout', logout);

module.exports = router;
