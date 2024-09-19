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
const isAdmin = require('../middlewares/admin');

router = express.Router();

router.post(
  '/api/comment/:type/:postId',
  verifyToken,
  async (req, res, next) => {
    if (req.params.type === 'qna') {
      return isAdmin(req, res, () => createComment(req, res, next));
    } else {
      return createComment(req, res, next);
    }
  }
);

// router.post('/api/comment/:type/:postId', verifyToken, createComment);

router.patch(
  '/api/comment/edit/:type/category/:categoryId/comment/:commentId',
  verifyToken,
  editComment
);

router.delete(
  '/api/comment/delete/:type/category/:categoryId/comment/:commentId',
  verifyToken,
  deleteComment
);

module.exports = router;
