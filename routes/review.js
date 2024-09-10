const express = require('express');
const {
  isLoggedIn,
  isNotLoggedIn,
  verifyToken,
  notUser,
} = require('../middlewares/auth');

const {
  createReview,
  reviewList,
  editReview,
  myReviewList,
  getReview,
  searchReview,
} = require('../controllers/review');
const router = express.Router();

router.post('/create', verifyToken, createReview);

router.get('/list', reviewList);

router.patch('/edit/:reviewId', verifyToken, editReview);

router.get('/mine', verifyToken, myReviewList);

router.get('/search', searchReview);

router.get('/:reviewId', notUser, getReview);

module.exports = router;
