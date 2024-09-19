const { Review, QnA, Consult } = require('../models/mysql/category');
const {
  ReviewComment,
  QnAComment,
  ConsultComment,
} = require('../models/mysql/comment');

const modelMapping = {
  review: {
    post: Review,
    comment: ReviewComment,
  },
  qna: {
    post: QnA,
    comment: QnAComment,
  },
  consult: {
    post: Consult,
    comment: ConsultComment,
  },
};

// 타입에 따른 모델 반환 함수
const getModelByType = (type, modelType) => {
  const model = modelMapping[type]?.[modelType];
  console.log(model);

  if (!model) {
    const error = new Error(
      `${type} 타입의 ${modelType}을(를) 찾을 수 없습니다.`
    );
    error.status = 400;
    throw error;
  }
  return model;
};

// 게시글 조회 함수
const getPost = async (type, postId) => {
  const currentModel = getModelByType(type, 'post');
  console.log(currentModel);

  const findPost = await currentModel.findByPk(postId);

  if (!findPost) {
    const error = new Error(`해당 ${type}의 게시글을 찾지 못하였습니다.`);
    error.status = 404;
    throw error; // 에러를 발생시킵니다.
  }

  return findPost;
};

// 댓글 모델 반환 함수
const getCommentModel = (type) => {
  return getModelByType(type, 'comment');
};

// 댓글 존재 여부 확인
const verifyCommentExists = async (CommentModel, commentId) => {
  const comment = await CommentModel.findByPk(commentId);
  // console.log(comment);

  if (!comment) {
    const error = new Error(`해당 댓글을 찾지 못했습니다.`);
    error.status = 404;
    throw error;
  }
  return comment;
};

// 댓글 작성자 확인
const verifyCommenter = (comment, commenterId) => {
  if (comment.commenter !== commenterId) {
    const error = new Error('본인이 작성한 댓글만 수정/삭제할 수 있습니다.');
    error.status = 403;
    throw error;
  }
};

// 댓글이 게시글에 속하는지 확인
const verifyCommentCategory = (comment, type, categoryId) => {
  if (comment[`${type}_id`] !== parseInt(categoryId, 10)) {
    const error = new Error('댓글이 해당 게시글에 포함되지 않습니다.');
    error.status = 403;
    throw error;
  }
};

const commentVerify = async (type, commentId, commenterId, categoryId) => {
  const CommentModel = getCommentModel(type);
  const comment = await verifyCommentExists(CommentModel, commentId);
  verifyCommenter(comment, commenterId);
  verifyCommentCategory(comment, type, categoryId);

  return { CommentModel, comment };
};

module.exports = {
  getPost,
  commentVerify,
  getCommentModel,
  verifyCommenter,
};
