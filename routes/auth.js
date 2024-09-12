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

router.post('/join', isNotLoggedIn, join);

router.post('/login', isNotLoggedIn, login);

// router.post('/logout', verifyToken, logout);
router.post('/logout', isLoggedIn, logout);

router.post('/refresh', isLoggedIn, refreshAccessToken);

router.post('/update', verifyToken, userUpdate);

// 유저 이메일 찾기
router.get('/findemail', findUserEmail);

// 로그인 시 비밀번호 변경
router.post('/password', verifyToken, userPasswordChange);

// 비밀번호 찾기전 확인
router.post('/findpassword', findUserPassword);

// 비밀번호 찾기 한 후에 비밀번호 수정
router.post('/findpassword/:userId', resetPassword);

router.delete('/withdraw', verifyToken, deleteUser);

module.exports = router;
