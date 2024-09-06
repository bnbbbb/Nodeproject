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
  searchReivew,
} = require('../controllers/post');
const router = express.Router();

router.post('/review', verifyToken, createReview);

router.get('/reviewlist', reviewList);

router.patch('/editreview/:reviewId', editReview);

router.get('/myreviews', verifyToken, myReviewList);

router.get('/reviews/search', searchReivew);

module.exports = router;
