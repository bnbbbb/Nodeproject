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

router.post('/:type/:postId', verifyToken, async (req, res, next) => {
  if (req.params.type === 'qna') {
    return isAdmin(req, res, () => createComment(req, res, next));
  }
  createComment;
});

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
