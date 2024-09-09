const express = require('express');
const passport = require('passport');
const {
  isLoggedIn,
  isNotLoggedIn,
  verifyToken,
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

router.patch('/edit/:qnaId', editQnA);

router.get('/mine', verifyToken, myQnAList);

router.get('/search', searchQnA);

router.get('/:qnaId', verifyToken, getQnA);

module.exports = router;
