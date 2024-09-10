const express = require('express');
const {
  isLoggedIn,
  isNotLoggedIn,
  verifyToken,
  notUser,
} = require('../middlewares/auth');
const {
  createComment,
  editComment,
  deleteComment,
} = require('../controllers/comment');

router = express.Router();

router.post('/:type/:postId', verifyToken, createComment);

router.patch(
  '/edit/:type/category/:categoryId/comment/:commentId',
  verifyToken,
  editComment
);

router.delete(
  '/delete/:type/category/:categoryId/comment/:commentId',
  verifyToken,
  deleteComment
);
module.exports = router;
