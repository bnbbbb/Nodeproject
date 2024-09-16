const {
  ReviewComment,
  QnAComment,
  ConsultComment,
} = require('../models/mysql/comment');

const commentVerify = async (type, commentId, commenterId, categoryId) => {
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
      const error = '댓글 type을 찾을 수 없습니다.';
      error.status = 400;
      throw error;
  }

  const comment = await CommentModel.findByPk(commentId);

  if (!comment) {
    const error = new Error(`해당 ${type}의 댓글을 찾지 못했습니다.`);
    error.status = 404;
    throw error;
  }

  if (comment.commenter !== commenterId) {
    const error = '본인이 작성한 댓글만 수정/삭제할 수 있습니다.';
    error.status = 403;
    throw error;
  }

  if (comment[`${type}_id`] !== parseInt(categoryId, 10)) {
    const error = '댓글이 해당 게시글에 포함되지 않습니다.';
    error.status = 403;
    throw error;
  }

  return { CommentModel, comment, error: null };
};

module.exports = commentVerify;
