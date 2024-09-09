const express = require('express');
const passport = require('passport');
const {
  isLoggedIn,
  isNotLoggedIn,
  verifyToken,
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

router.patch('/edit/:reviewId', editReview);

router.get('/mine', verifyToken, myReviewList);

router.get('/search', searchReview);

router.get('/:reviewId', verifyToken, getReview);

module.exports = router;
