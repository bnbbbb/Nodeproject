const { Op } = require('sequelize');
const { QnA } = require('../models/mysql/category');
const User = require('../models/mysql/user');
const pool = require('../utils/sql');
const jwt = require('jsonwebtoken');
const { QnAComment } = require('../models/mysql/comment');
const moment = require('moment-timezone');
const { verifyPost } = require('../utils/postUtils');
const { sequelize } = require('../models/mysql');

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
    console.log(error);
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
// TODO 조회수 수정 필요함
exports.getQnA = async (req, res, next) => {
  try {
    const { qnaId } = req.params;

    let userId = null;

    // 로그인한 사용자 확인
    if (req.user) {
      userId = req.user.id;
    }

    // 조회수 중복 방지
    let viewedData = {};
    if (req.cookies.viewedData) {
      try {
        viewedData = JSON.parse(req.cookies.viewedData);
      } catch (err) {
        console.error('쿠키 파싱 오류:', err);
      }
    }

    viewedData.qnas = viewedData.qnas || {};

    // // 로그인 사용자 처리
    // if (userId) {
    //   if (!viewedData.qnas[userId]) {
    //     viewedData.qnas[userId] = {};
    //   }
    //   if (!viewedData.qnas[userId][qnaId]) {
    //     await QnA.increment('hits', { where: { id: qnaId } });
    //     viewedData.qnas[userId][qnaId] = true;
    //     res.cookie('viewedData', JSON.stringify(viewedData), {
    //       maxAge: 24 * 60 * 60 * 1000,
    //       httpOnly: true,
    //     });
    //   }
    // }

    // // 비로그인 사용자 처리
    // else {
    //   const ipAddress = req.ip;
    //   if (!viewedData.qnas[ipAddress]) {
    //     viewedData.qnas[ipAddress] = {};
    //   }
    //   if (!viewedData.qnas[ipAddress][qnaId]) {
    //     await QnA.increment('hits', { where: { id: qnaId } });
    //     viewedData.qnas[ipAddress][qnaId] = true;
    //     res.cookie('viewedData', JSON.stringify(viewedData), {
    //       maxAge: 24 * 60 * 60 * 1000,
    //       httpOnly: true,
    //     });
    //   }
    // }
    // { qnas: { '1': { '2': true }, '::1': { '2': true } } }
    // Query
    // 로그인 사용자 처리
    if (userId) {
      if (!viewedData.qnas[userId]) {
        viewedData.qnas[userId] = {};
      }
      if (!viewedData.qnas[userId][qnaId]) {
        const incrementQuery = `
          UPDATE qnas
          SET hits = hits + 1
          WHERE id = :qnaId
        `;
        await sequelize.query(incrementQuery, {
          replacements: { qnaId },
          type: sequelize.QueryTypes.UPDATE,
        });
        viewedData.qnas[userId][qnaId] = true;
        res.cookie('viewedData', JSON.stringify(viewedData), {
          maxAge: 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
      }
    }

    // 비로그인 사용자 처리
    else {
      const ipAddress = req.ip;
      if (!viewedData.qnas[ipAddress]) {
        viewedData.qnas[ipAddress] = {};
      }
      if (!viewedData.qnas[ipAddress][qnaId]) {
        const incrementQuery = `
          UPDATE qnas
          SET hits = hits + 1
          WHERE id = :qnaId
        `;
        await sequelize.query(incrementQuery, {
          replacements: { qnaId },
          type: sequelize.QueryTypes.UPDATE,
        });
        viewedData.qnas[ipAddress][qnaId] = true;
        res.cookie('viewedData', JSON.stringify(viewedData), {
          maxAge: 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
      }
    }
    console.log(viewedData);

    const qna = await QnA.findOne({
      where: { id: qnaId },
      include: [
        {
          model: QnAComment,
        },
      ],
    });
    if (!qna) {
      const error = new Error('해당 상담내역이 존재하지 않습니다.');
      error.status = 401;
      throw error;
    }
    const formatteQnAs = {
      ...qna.toJSON(),
      createdAt: moment(qna.createdAt)
        .tz('Asia/Seoul')
        .format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment(qna.updatedAt)
        .tz('Asia/Seoul')
        .format('YYYY-MM-DD HH:mm:ss'),
    };

    return res.status(200).json({ code: 200, formatteQnAs });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
