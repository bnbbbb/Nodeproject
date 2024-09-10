const express = require('express');
const {
  isLoggedIn,
  isNotLoggedIn,
  verifyToken,
  notUser,
} = require('../middlewares/auth');

const {
  createConsult,
  consultList,
  editConsult,
  myConsultList,
  searchConsult,
  getConsult,
} = require('../controllers/consult');
const router = express.Router();

router.post('/create', verifyToken, createConsult);

router.get('/list', consultList);

router.patch('/edit/:consultId', verifyToken, editConsult);

router.get('/mine', verifyToken, myConsultList);

router.get('/search', searchConsult);

router.get('/:consultId', notUser, getConsult);

module.exports = router;
