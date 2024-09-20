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
  deleteUser,
} = require('../controllers/auth');
const {
  isLoggedIn,
  isNotLoggedIn,
  verifyToken,
} = require('../middlewares/auth');
const { refreshAccessToken } = require('../utils/token');
const router = express.Router();

// router.post('/api/auth/join', isNotLoggedIn, join);
router.post('/api/auth/join', join);

router.post('/api/auth/login', isNotLoggedIn, login);

// router.post('/logout', verifyToken, logout);
router.post('/api/auth/logout', isLoggedIn, logout);

router.post('/api/auth/refresh', isLoggedIn, refreshAccessToken);

router.post('/api/auth/update', verifyToken, userUpdate);

// 유저 이메일 찾기
router.get('/api/auth/findemail', findUserEmail);

// 로그인 시 비밀번호 변경
router.post('/api/auth/password', verifyToken, userPasswordChange);

// 비밀번호 찾기전 확인
router.post('/api/auth/findpassword', findUserPassword);

// 비밀번호 찾기 한 후에 비밀번호 수정
router.post('/api/auth/findpassword/:userId', resetPassword);

router.delete('/api/auth/withdraw', verifyToken, deleteUser);

module.exports = router;
