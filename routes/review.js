const express = require('express');
const { verifyToken, notUser } = require('../middlewares/auth');

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

router.get('/api/review/:reviewId', notUser, getReview);

router.delete('/api/review/delete/:reviewId', verifyToken, deleteReview);

module.exports = router;
