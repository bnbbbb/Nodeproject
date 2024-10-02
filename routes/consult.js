const express = require('express');
const { verifyToken, notUser } = require('../middlewares/auth');

const {
  createConsult,
  consultList,
  editConsult,
  myConsultList,
  searchConsult,
  getConsult,
  deleteConsult,
} = require('../controllers/consult');
const router = express.Router();

router.post('/api/consult/create', verifyToken, createConsult);

router.get('/api/consult/list', consultList);

router.patch('/api/consult/edit/:consultId', verifyToken, editConsult);

router.get('/api/consult/mine', verifyToken, myConsultList);

router.get('/api/consult/search', searchConsult);

router.get('/api/consult/:consultId', notUser, getConsult);

router.delete('/api/qna/delete/:consultId', verifyToken, deleteConsult);

module.exports = router;
