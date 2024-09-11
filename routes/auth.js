const express = require('express');
const {
  join,
  login,
  logout,
  userUpdate,
  userPasswordChange,
  findUserEmail,
  findUserPassword,
  resetPassword,
} = require('../controllers/auth');
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

router.post('/update', verifyToken, userUpdate);

router.post('/password', verifyToken, userPasswordChange);

// 유저 이메일 찾기
router.get('/findemail', findUserEmail);

// 비밀번호 찾기전 확인
router.post('/findpassword', findUserPassword);

router.post('/findpassword/:userId', resetPassword);

module.exports = router;
