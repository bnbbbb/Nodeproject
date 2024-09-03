const express = require('express');
const { join, login } = require('../controllers/auth');
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares/auth');
const router = express.Router();

router.post('/join', isNotLoggedIn, join);

router.post('/login', isNotLoggedIn, login);

router.get('/logout', isLoggedIn, logout);

module.exports = router;
