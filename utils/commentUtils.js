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
      return { error: '댓글 type을 찾을 수 없습니다.', status: 400 };
  }

  const comment = await CommentModel.findByPk(commentId);

  if (!comment) {
    return { error: `해당 ${type}의 댓글을 찾지 못했습니다.`, status: 404 };
  }

  if (comment.commenter !== commenterId) {
    return {
      error: '본인이 작성한 댓글만 수정/삭제할 수 있습니다.',
      status: 403,
    };
  }

  if (comment[`${type}_id`] !== parseInt(categoryId, 10)) {
    return {
      error: '댓글이 해당 게시글에 포함되지 않습니다.',
      status: 403,
    };
  }

  return { CommentModel, comment, error: null };
};

module.exports = commentVerify;
