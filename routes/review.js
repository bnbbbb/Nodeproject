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
  deleteReview,
} = require('../controllers/review');
const router = express.Router();

router.post('/api/review/create', verifyToken, createReview);

router.get('/api/review/list', reviewList);

router.patch('/api/review/edit/:reviewId', verifyToken, editReview);

router.get('/api/review/mine', verifyToken, myReviewList);

router.get('/api/review/search', searchReview);

router.delete('/api/qna/delete/:reviewId', verifyToken, deleteReview);

router.get('/api/review/:reviewId', notUser, getReview);

module.exports = router;
