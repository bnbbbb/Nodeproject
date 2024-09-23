const moment = require('moment-timezone');
const {
  ReviewComment,
  ConsultComment,
  QnAComment,
} = require('../models/mysql/comment');
const {
  commentVerify,
  getCommentModel,
  getPost,
  verifyCommenter,
} = require('../utils/commentUtils');
const { sequelize } = require('../models/mysql');

const createComment = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { type, postId } = req.params;
    const { comment } = req.body;
    const commenterId = req.user.id;
    await getPost(type, postId);

    // ORM
    // const CommentModel = getCommentModel(type);

    // const newComment = await CommentModel.create({
    //   comment,
    //   [`${type}_id`]: postId,
    //   commenter: commenterId,
    // });

    // Query
    const commentQuery = `insert into ${type}_comments 
      (comment, ${type}_id, commenter, createdAt, updatedAt)
      values (:comment, :postId, :commenterId, NOW(), NOW())`;

    const newComment = await sequelize.query(commentQuery, {
      replacements: {
        comment,
        postId,
        commenterId,
      },
      type: sequelize.QueryTypes.INSERT,
      transaction,
    });
    await transaction.commit();
    res
      .status(200)
      .json({ code: 200, message: '댓글이 성공적으로 생성되었습니다.' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    next(error);
  }
};

const editComment = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { type, categoryId, commentId } = req.params;
    const updatedData = req.body;
    const commenterId = req.user.id;

    await getPost(type, categoryId);

    const { CommentModel, comment } = await commentVerify(
      type,
      commentId,
      commenterId,
      categoryId
    );

    // ORM
    // const [updatedCount] = await CommentModel.update(updatedData, {
    //   where: { id: commentId },
    //   paranoid: false,
    // });

    // Query
    const updateQuery = `
      update ${type}_comments
      set comment = :comment, updatedAt = NOW()
      where id = :commentId
    `;

    const updatedCount = await sequelize.query(updateQuery, {
      replacements: {
        comment: updatedData.comment, // 업데이트할 데이터
        commentId,
      },
      type: sequelize.QueryTypes.UPDATE,
      transaction,
    });
    await transaction.commit();
    if (updatedCount === 0) {
      const error = new Error(
        '댓글 수정 중 오류가 발생했습니다. 다시 시도해 주세요.'
      );
      throw error;
    }
    const updatedComment = await CommentModel.findByPk(commentId);

    return res.status(200).json({ code: 200, message: updatedComment });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { type, categoryId, commentId } = req.params;
    const commenterId = req.user.id;
    const { CommentModel, comment } = await commentVerify(
      type,
      commentId,
      commenterId,
      categoryId
    );

    // ORM
    // await CommentModel.destroy({ where: { id: commentId } });

    // Query
    const findQuery = `
    select *
    from ${type}_comments
    where id = :commentId and ${type}_id = :categoryId`;

    const [findComment] = await sequelize.query(findQuery, {
      replacements: { commentId, categoryId },
      type: sequelize.QueryTypes.SELECT,
    });
    verifyCommenter(findComment, commenterId);

    const deleteQuery = `delete from ${type}_comments where id = :commentId`;

    await sequelize.query(deleteQuery, {
      replacements: { commentId },
      type: sequelize.QueryTypes.DELETE,
      transaction,
    });
    await transaction.commit();
    return res
      .status(200)
      .json({ code: 200, message: '댓글을 삭제하였습니다.' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    next(error);
  }
};

module.exports = { createComment, editComment, deleteComment };
