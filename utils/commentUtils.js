const { sequelize } = require('../models/mysql');
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
  const tableName = currentModel.getTableName();

  // const findPost = await currentModel.findByPk(postId);

  const postQuery = `select * from ${tableName} where id = :postId`;

  const findPost = await sequelize.query(postQuery, {
    replacements: {
      postId,
    },
    type: sequelize.QueryTypes.SELECT,
  });

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
const verifyCommentExists = async (type, CommentModel, commentId) => {
  // const comment = await CommentModel.findByPk(commentId);
  const commentQuery = `select * from ${type}_comments WHERE id = :commentId;`;
  const comments = await sequelize.query(commentQuery, {
    replacements: {
      commentId,
    },
    type: sequelize.QueryTypes.SELECT,
  });
  const comment = comments[0];
  if (!comment) {
    const error = new Error(`해당 댓글을 찾지 못했습니다.`);
    error.status = 404;
    throw error;
  }
  return comment;
};

// 댓글 작성자 확인
const verifyCommenter = (comment, commenterId) => {
  console.log(comment.commenter, commenterId);

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

const groupedData = (rawData, type) => {
  return rawData.reduce((acc, row) => {
    console.log(row);

    // 게시판 타입에 따라 ID를 구분
    const idKey =
      type === 'review'
        ? 'reviewId'
        : type === 'consult'
        ? 'consultId'
        : type === 'qna'
        ? 'qnaId'
        : null;

    if (!idKey) return acc;

    const existingPost = acc.find((data) => data[idKey] === row[idKey]);

    if (!existingPost) {
      acc.push({
        type: row.type,
        [idKey]: row[idKey],
        title: row.title,
        content: row.content,
        hits: row.hits,
        createdAt: row.createdAt,
        writer: row.writer,
        comments: [],
      });
    }

    const postToUpdate = acc.find((post) => post[idKey] === row[idKey]);
    postToUpdate.comments.push({
      commentId: row.commentId,
      comment: row.comment,
      commentCreatedAt: row.commentCreatedAt,
      commenter: row.commenter,
    });

    return acc;
  }, []);
};

const commentVerify = async (type, commentId, commenterId, categoryId) => {
  const CommentModel = getCommentModel(type);
  const comment = await verifyCommentExists(type, CommentModel, commentId);
  verifyCommenter(comment, commenterId);
  verifyCommentCategory(comment, type, categoryId);

  return { CommentModel, comment };
};

module.exports = {
  getPost,
  commentVerify,
  getCommentModel,
  verifyCommenter,
  groupedData,
};
