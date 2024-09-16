const moment = require('moment-timezone');
const {
  ReviewComment,
  ConsultComment,
  QnAComment,
} = require('../models/mysql/comment');
const commentVerify = require('../utils/commentUtils');

const createComment = async (req, res, next) => {
  try {
    const { type, postId } = req.params;
    const { comment } = req.body;
    const commenterId = req.user.id;
    let CommentModel;

    switch (type) {
      case 'review':
        CommentModel = ReviewComment;
        break;
      case 'qna':
        CommentModel = QnAComment;
        break;
      case 'consult':
        CommentModel = ConsultComment;
        break;
      default:
        return res
          .status(400)
          .json({ code: 400, message: '댓글 type을 찾을 수 없습니다.' });
    }
    const newComment = await CommentModel.create({
      comment,
      [`${type}_id`]: postId,
      commenter: commenterId,
    });
    res.status(200).json({ code: 200, message: newComment });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const editComment = async (req, res, next) => {
  try {
    const { type, categoryId, commentId } = req.params;
    const updatedData = req.body;
    const commenterId = req.user.id;

    const { CommentModel, comment, error, status } = await commentVerify(
      type,
      commentId,
      commenterId,
      categoryId
    );
    if (error) {
      return res.status(status).json({ code: status, message: error });
    }

    const [updatedCount] = await CommentModel.update(updatedData, {
      where: { id: commentId },
      paranoid: false,
    });

    if (updatedCount === 0) {
      return res.status(500).json({
        code: 500,
        message: '댓글 수정 중 오류가 발생했습니다.',
      });
    }
    const updatedComment = await CommentModel.findByPk(commentId);

    return res.status(200).json({ code: 200, message: updatedComment });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { type, categoryId, commentId } = req.params;
    const commenterId = req.user.id;
    const { CommentModel, comment, error, status } = await commentVerify(
      type,
      commentId,
      commenterId,
      categoryId
    );
    if (error) {
      return res.status(status).json({ code: status, message: error });
    }
    await CommentModel.destroy({ where: { id: commentId } });
    return res
      .status(200)
      .json({ code: 200, message: '댓글을 삭제하였습니다.' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { createComment, editComment, deleteComment };
