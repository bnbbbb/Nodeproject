const express = require('express');
const {
  isLoggedIn,
  isNotLoggedIn,
  verifyToken,
  notUser,
} = require('../middlewares/auth');
const {
  createQnA,
  qnaList,
  editQnA,
  myQnAList,
  searchQnA,
  getQnA,
} = require('../controllers/qna');
const router = express.Router();

router.post('/create', verifyToken, createQnA);

router.get('/list', qnaList);

router.patch('/edit/:qnaId', verifyToken, editQnA);

router.get('/mine', verifyToken, myQnAList);

router.get('/search', searchQnA);

router.get('/:qnaId', notUser, getQnA);

module.exports = router;
