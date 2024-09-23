const { Op } = require('sequelize');
const { Consult } = require('../models/mysql/category');
const User = require('../models/mysql/user');
const pool = require('../utils/sql');
const jwt = require('jsonwebtoken');
const { ConsultComment } = require('../models/mysql/comment');
const moment = require('moment-timezone');
const { sequelize } = require('../models/mysql');
const { verifyPost } = require('../utils/postUtils');

exports.createConsult = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { title, content } = req.body;
    const userId = req.user.id;
    // ORM
    // const consult = await Consult.create({
    //   //verifyToken으로 userId 전달
    //   writer: userId,
    //   title,
    //   content,
    // });
    // return res.status(200).json({ code: 200, consult });

    // 임시 SQL 적용 코드 - 작동x
    // const sql =
    //   'INSERT INTO consults (consult_writer, title, content) VALUES (?, ?, ?)';
    // const [result] = await pool.query(sql, [req.user.id, title, content]);
    // const consultId = result.insertId;
    // return res.status(200).json({
    //   code: 200,
    //   consult: { id: consultId, consult_writer: req.user.id, title, content },
    // });
    // Query
    const query = `
      INSERT INTO consults (writer, title, content, createdAt, updatedAt) 
      VALUES (?, ?, ?, NOW(), NOW())
    `;

    const consults = await sequelize.query(query, {
      replacements: [userId, title, content], // 세 개의 값을 전달
      type: sequelize.QueryTypes.INSERT,
      transaction,
    });
    await transaction.commit();
    return res
      .status(201)
      .json({ code: 201, message: 'consult가 성공적으로 생성되었습니다.' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    next(error);
  }
};

// 전체 상담 보기
exports.consultList = async (req, res, next) => {
  try {
    // const consults = await Consult.findAll();

    // const formatteConsults = consults.map((consult) => {
    //   return {
    //     ...consult.toJSON(),
    //     createdAt: moment(consult.createdAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //     updatedAt: moment(consult.updatedAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //   };
    // });
    // SQL Query
    const query = `
      SELECT id, title, content, hits, createdAt, updatedAt, deletedAt, writer
      FROM consults
      WHERE deletedAt IS NULL
    `;
    const consults = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    const formatteConsults = consults.map((consult) => {
      return {
        ...consult,
        createdAt: moment(consult.createdAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(consult.updatedAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
      };
    });
    return res.status(200).json({ code: 200, formatteConsults });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 내가 쓴 상담 보기
exports.myConsultList = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // ORM
    // const userId = req.user.id;
    // const consults = await Consult.findAll({
    //   where: { consult_writer: userId },
    // });
    // const formatteConsults = consults.map((consult) => {
    //   return {
    //     ...consult.toJSON(),
    //     createdAt: moment(consult.createdAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //     updatedAt: moment(consult.updatedAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //   };
    // });

    // Query
    const query = `
      SELECT id, title, content, hits, createdAt, updatedAt, deletedAt, writer
      FROM consults
      WHERE deletedAt IS NULL AND writer = ?
    `;

    const consults = await sequelize.query(query, {
      // bind: [userId],
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT,
    });
    const formatteConsults = consults.map((consult) => {
      return {
        ...consult,
        createdAt: moment(consult.createdAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(consult.updatedAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
      };
    });

    return res.status(200).json({ code: 200, formatteConsults });
  } catch (error) {
    console.error(error);
    // return res
    //   .status(500)
    //   .json({ code: 500, message: '서버 오류가 발생했습니다.' });
    next(error);
  }
};

// 검색한 상담 보기
exports.searchConsult = async (req, res, next) => {
  try {
    const searchQuery = req.query.query;
    if (!searchQuery) {
      const error = new Error('검색어가 필요합니다.');
      error.status = 400;

      throw error;
    }

    // ORM
    // const consults = await Consult.findAll({
    //   include: [
    //     {
    //       model: User, // User 모델을 포함
    //       attributes: ['username'], // 사용자 이름만 가져오기
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
    // const formatteConsults = consults.map((consult) => {
    //   return {
    //     ...consult.toJSON(),
    //     createdAt: moment(consult.createdAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //     updatedAt: moment(consult.updatedAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //   };
    // });

    // Query

    const query = `select q.* from consults as q
    join users as u on q.writer = u.id
    where q.title like :query
    or q.content like :query
    or u.username like :query
    `;
    const queryParam = `%${searchQuery}%`;
    const consults = await sequelize.query(query, {
      replacements: { query: queryParam },
      type: sequelize.QueryTypes.SELECT,
    });

    const formatteConsults = consults.map((consult) => {
      return {
        ...consult,
        createdAt: moment(consult.createdAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(consult.updatedAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
      };
    });

    return res.status(200).json({ code: 200, formatteConsults });
  } catch (error) {
    console.error('Error:', error); // 오류 로그
    return res.status(400).json({ code: 400, message: error.message });
  }
};

// 상담 수정
exports.editConsult = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { consultId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    // ORM
    // const consult = await Consult.findByPk(consultId);
    // // await verifyPost(consult, userId, 'Consult');
    // const [updatedCount] = await Consult.update(updateData, {
    //   where: { id: consultId },
    //   paranoid: false,
    // });

    // Query
    const findQuery = `
    select *
    from consults
    where id = :consultId`;
    const [consult] = await sequelize.query(findQuery, {
      replacements: { consultId },
      type: sequelize.QueryTypes.SELECT,
    });
    console.log(consult);

    await verifyPost(consult, userId, '상담');
    const title = updateData.title || consult.title;
    const content = updateData.content || consult.content;

    const updateQuery = `
      UPDATE consults
      SET title = :title,
        content = :content,
        updatedAt = NOW()
      WHERE id = :consultId
    `;

    const [updatedCount] = await sequelize.query(updateQuery, {
      replacements: {
        title,
        content,
        consultId,
      },
      type: sequelize.QueryTypes.UPDATE,
      transaction,
    });

    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ code: 404, message: '상담 수정 중 오류가 발생했습니다.' });
    }

    await transaction.commit();
    const updateConsult = await Consult.findByPk(consultId);
    return res.status(200).json({ code: 200, message: updateConsult });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    next(error);
  }
};

// 삭제
exports.deleteConsult = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { consultId } = req.params;
    const userId = req.user.id;

    // ORM
    // const consult = await consult.findByPk(consultId);
    // await verifyPost(consult, userId, '상담');
    // await consult.destroy();

    // Query
    const findQuery = `
    select *
    from consults
    where id = :consultId`;
    const [consult] = await sequelize.query(findQuery, {
      replacements: { consultId },
      type: sequelize.QueryTypes.SELECT,
    });

    await verifyPost(consult, userId, 'consult');

    const deleteQuery = `
    delete from consults where id = :consultId`;

    await sequelize.query(deleteQuery, {
      replacements: { consultId },
      type: sequelize.QueryTypes.DELETE,
      transaction,
    });
    await transaction.commit();
    return res.status(200).json({ message: 'consult 삭제에 성공하였습니다.' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// 상세 페이지
exports.getConsult = async (req, res, next) => {
  try {
    const { consultId } = req.params;
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

    viewedData.consults = viewedData.consults || {};

    // 로그인 사용자 처리
    if (userId) {
      if (!viewedData.consults[userId]) {
        viewedData.consults[userId] = {};
      }
      if (!viewedData.consults[userId][consultId]) {
        await Consult.increment('hits', { where: { id: consultId } });
        viewedData.consults[userId][consultId] = true;
        res.cookie('viewedData', JSON.stringify(viewedData), {
          maxAge: 24 * 60 * 60 * 1000, // 24시간
          httpOnly: true,
        });
      }
    }

    // 비로그인 사용자 처리
    else {
      const ipAddress = req.ip;
      if (!viewedData.consults[ipAddress]) {
        viewedData.consults[ipAddress] = {};
      }
      if (!viewedData.consults[ipAddress][consultId]) {
        await Consult.increment('hits', { where: { id: consultId } });
        viewedData.consults[ipAddress][consultId] = true;

        res.cookie('viewedData', JSON.stringify(viewedData), {
          maxAge: 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
      }
    }

    const consult = await Consult.findOne({
      where: { id: consultId },
      include: [
        {
          model: ConsultComment,
        },
      ],
    });
    if (!consult) {
      const error = new Error('해당 상담내역이 존재하지 않습니다.');
      error.status = 401;
      throw error;
    }
    const formatteConsults = {
      ...consult.toJSON(),
      createdAt: moment(consult.createdAt)
        .tz('Asia/Seoul')
        .format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment(consult.updatedAt)
        .tz('Asia/Seoul')
        .format('YYYY-MM-DD HH:mm:ss'),
    };

    return res.status(200).json({ code: 200, formatteConsults });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
