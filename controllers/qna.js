const { Op } = require('sequelize');
const { QnA } = require('../models/mysql/category');
const User = require('../models/mysql/user');
const pool = require('../utils/sql');
const jwt = require('jsonwebtoken');
const { QnAComment } = require('../models/mysql/comment');
const moment = require('moment-timezone');
const { verifyPost } = require('../utils/postUtils');
const { sequelize } = require('../models/mysql');
const requestIp = require('request-ip');
const { v4: uuidv4 } = require('uuid');
const hitsPost = require('../utils/hitsPost');
const handleError = require('../utils/utils');
const verifyPostExists = require('../utils/postUtils');
const { groupedData } = require('../utils/commentUtils');
// QnA 관련 메소드

exports.createQnA = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    // ORM
    // const qna = await QnA.create({
    //   //verifyToken으로 userId 전달
    //   writer: req.user.id,
    //   title,
    //   content,
    // });
    // return res.status(200).json({ code: 200, qna });

    // Query
    const query = `
      INSERT INTO qnas (writer, title, content, createdAt, updatedAt) 
      VALUES (?, ?, ?, NOW(), NOW())
    `;

    const qnas = await sequelize.query(query, {
      replacements: [userId, title, content], // 세 개의 값을 전달
      type: sequelize.QueryTypes.INSERT,
    });
    return res
      .status(201)
      .json({ code: 201, message: 'QnA가 성공적으로 생성되었습니다.' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 전체 QnA 보기
exports.qnaList = async (req, res, next) => {
  try {
    // ORM
    // const qnas = await QnA.findAll();
    // const formatteQnAs = qnas.map((qna) => {
    //   return {
    //     ...qna.toJSON(),
    //     createdAt: moment(qna.createdAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //     updatedAt: moment(qna.updatedAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //   };
    // });

    // SQL Query
    const query = `
      SELECT id, title, content, hits, createdAt, updatedAt, deletedAt, writer
      FROM qnas
      WHERE deletedAt IS NULL
    `;
    const qnas = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    const formatteQnAs = qnas.map((qna) => {
      return {
        ...qna,
        createdAt: moment(qna.createdAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(qna.updatedAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
      };
    });
    return res.status(200).json({ code: 200, formatteQnAs });
  } catch (error) {
    console.error(error);
    // return res.status(500).json({ code: 500, message: error.message });
    next(error);
  }
};

// 내가 쓴 QnA 보기
exports.myQnAList = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // ORM
    // const qnas = await QnA.findAll({
    //   where: { writer: userId },
    // });

    // const formatteQnAs = qnas.map((qna) => {
    //   return {
    //     ...qna.toJSON(),
    //     createdAt: moment(qna.createdAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //     updatedAt: moment(qna.updatedAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //   };
    // });

    // Query
    const query = `
      SELECT id, title, content, hits, createdAt, updatedAt, deletedAt, writer
      FROM qnas
      WHERE deletedAt IS NULL AND writer = ?
    `;

    const qnas = await sequelize.query(query, {
      // bind: [userId],
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT,
    });
    const formatteQnAs = qnas.map((qna) => {
      return {
        ...qna,
        createdAt: moment(qna.createdAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(qna.updatedAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
      };
    });

    return res.status(200).json({ code: 200, formatteQnAs });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 검색한 QnA 보기
exports.searchQnA = async (req, res, next) => {
  try {
    const searchQuery = req.query.query;
    if (!searchQuery) {
      const error = new Error('검색어가 필요합니다.');
      error.status = 400;

      throw error;
    }

    // ORM

    // const qnas = await QnA.findAll({
    //   include: [
    //     {
    //       model: User,
    //       attributes: ['username'],
    //     },
    //   ],
    //   where: {
    //     [Op.or]: [
    //       {
    //         title: {
    //           [Op.like]: `%${query}%`,
    //         },
    //       },
    //       {
    //         content: {
    //           [Op.like]: `%${query}%`,
    //         },
    //       },
    //       {
    //         '$User.username$': {
    //           [Op.like]: `%${query}%`,
    //         },
    //       },
    //     ],
    //   },
    // });

    // const formatteQnAs = qnas.map((qna) => {
    //   return {
    //     ...qna.toJSON(),
    //     createdAt: moment(qna.createdAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //     updatedAt: moment(qna.updatedAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //   };
    // });

    // Query

    const query = `select q.* from qnas as q
    join users as u on q.writer = u.id
    where q.title like :query
    or q.content like :query
    or u.username like :query
    `;
    const queryParam = `%${searchQuery}%`;
    const qnas = await sequelize.query(query, {
      replacements: { query: queryParam },
      type: sequelize.QueryTypes.SELECT,
    });

    const formatteQnAs = qnas.map((qna) => {
      return {
        ...qna,
        createdAt: moment(qna.createdAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(qna.updatedAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
      };
    });

    return res.status(200).json({ code: 200, formatteQnAs });
  } catch (error) {
    console.error('Error:', error); // 오류 로그
    return res.status(400).json({ code: 400, message: error.message });
  }
};

// qna 수정
exports.editQnA = async (req, res, next) => {
  try {
    const { qnaId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    // ORM
    // const qna = await QnA.findByPk(qnaId);
    // await verifyPost(qna, userId, 'QnA');
    // const [updatedCount] = await QnA.update(updateData, {
    //   where: { id: qnaId },
    //   paranoid: false,
    // });

    // Query
    const findQuery = `
    select *
    from qnas
    where id = :qnaId`;
    const [qna] = await sequelize.query(findQuery, {
      replacements: { qnaId },
      type: sequelize.QueryTypes.SELECT,
    });

    await verifyPost(qna, userId, 'QnA');
    const title = updateData.title || qna.title;
    const content = updateData.content || qna.content;

    const updateQuery = `
      UPDATE qnas
      SET title = :title,
        content = :content,
        updatedAt = NOW()
      WHERE id = :qnaId
    `;

    const [updatedCount] = await sequelize.query(updateQuery, {
      replacements: {
        title,
        content,
        qnaId,
      },
      type: sequelize.QueryTypes.UPDATE,
    });

    if (updatedCount === 0) {
      const error = new Error('QnA 수정 중 오류가 발생했습니다.');
      error.status = 404;
      throw error;
    }

    const updateQnA = await QnA.findByPk(qnaId);

    return res.status(200).json({ code: 200, message: updateQnA });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 삭제
exports.deleteQnA = async (req, res, next) => {
  try {
    const { qnaId } = req.params;
    const userId = req.user.id;

    // ORM
    // const qna = await QnA.findByPk(qnaId);
    // await verifyPost(qna, userId, 'QnA');
    // await qna.destroy();

    // Query
    const findQuery = `
    select *
    from qnas
    where id = :qnaId`;
    const [qna] = await sequelize.query(findQuery, {
      replacements: { qnaId },
      type: sequelize.QueryTypes.SELECT,
    });

    await verifyPost(qna, userId, 'QnA');

    const deleteQuery = `
    delete from qnas where id = :qnaId`;

    await sequelize.query(deleteQuery, {
      replacements: { qnaId },
      type: sequelize.QueryTypes.DELETE,
    });

    return res.status(200).json({ message: 'QnA 삭제에 성공하였습니다.' });
  } catch (error) {
    next(error);
  }
};

// 상세 페이지
exports.getQnA = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { qnaId } = req.params;
    const qnaQueryFirst = `
      select * from qnas
      where id = ?
      `;
    const qnaFirst = await sequelize.query(qnaQueryFirst, {
      replacements: [qnaId],
      type: sequelize.QueryTypes.SELECT,
    });

    if (qnaFirst.length < 1)
      return handleError(404, '해당 QnA가 존재하지 않습니다.');

    let userId = req.user ? req.user.id : null;

    let userIp = requestIp.getClientIp(req);

    if (userIp.startsWith('::ffff:')) {
      userIp = userIp.slice(7);
    }

    // const hits = await hitsPost(qnaId, userIp, 'QnA', { transaction });
    const hits = await hitsPost.createHitPost(qnaId, userIp, 'QnA');

    if (hits) {
      const qnaUpdateQuery = `
          update qnas
          set hits = hits + 1
          where id = ?
        `;
      const qnaUpdate = await sequelize.query(qnaUpdateQuery, {
        replacements: [qnaId],
        type: sequelize.QueryTypes.UPDATE,
        transaction,
      });
      await transaction.commit();
    }

    const qnaQuery = `
      SELECT q.id AS qnaId, q.title, q.content, q.hits, q.createdAt AS qnaCreatedAt, q.writer,
      c.id AS commentId, c.comment, c.createdAt AS commentCreatedAt, c.commenter
      FROM qnas AS q
      LEFT JOIN qna_comments AS c ON c.qna_id = q.id
      WHERE q.id = ?;
      `;
    const qna = await sequelize.query(qnaQuery, {
      replacements: [qnaId],
      type: sequelize.QueryTypes.SELECT,
    });
    const qnaGroup = groupedData(qna, 'qna');

    return res.status(200).json({ code: 200, qnaGroup });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    next(error);
  }
};
