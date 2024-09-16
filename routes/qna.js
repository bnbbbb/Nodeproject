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
  deleteQnA,
} = require('../controllers/qna');
const router = express.Router();

router.post('/api/qna/create', verifyToken, createQnA);

router.get('/api/qna/list', qnaList);

router.patch('/api/qna/edit/:qnaId', verifyToken, editQnA);

router.get('/api/qna/mine', verifyToken, myQnAList);

router.get('/api/qna/search', searchQnA);

router.get('/api/qna/:qnaId', notUser, getQnA);

router.delete('/api/qna/delete/:qnaId', verifyToken, deleteQnA);

module.exports = router;
