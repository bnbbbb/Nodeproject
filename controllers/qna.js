const { Op } = require('sequelize');
const { QnA } = require('../models/mysql/category');
const User = require('../models/mysql/user');
const pool = require('../utils/sql');
const jwt = require('jsonwebtoken');
const { QnAComment } = require('../models/mysql/comment');
const moment = require('moment-timezone');
const { verifyPost } = require('../utils/postUtils');

// 리뷰 관련 메소드

exports.createQnA = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const qna = await QnA.create({
      //verifyToken으로 userId 전달
      writer: req.user.id,
      title,
      content,
    });
    return res.status(200).json({ code: 200, qna });

    // 임시 SQL 적용 코드 - 작동x
    // const sql =
    //   'INSERT INTO qnas (qna_writer, title, content) VALUES (?, ?, ?)';
    // const [result] = await pool.query(sql, [req.user.id, title, content]);
    // const qnaId = result.insertId;
    // return res.status(200).json({
    //   code: 200,
    //   qna: { id: qnaId, qna_writer: req.user.id, title, content },
    // });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 전체 리뷰 보기
exports.qnaList = async (req, res, next) => {
  try {
    const qnas = await QnA.findAll();

    const formatteQnAs = qnas.map((qna) => {
      return {
        ...qna.toJSON(),
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

// 내가 쓴 리뷰 보기
exports.myQnAList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const qnas = await QnA.findAll({
      where: { writer: userId },
    });

    const formatteQnAs = qnas.map((qna) => {
      return {
        ...qna.toJSON(),
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
    // return res
    //   .status(500)
    //   .json({ code: 500, message: '서버 오류가 발생했습니다.' });
    next(error);
  }
};

// 검색한 리뷰 보기
exports.searchQnA = async (req, res, next) => {
  try {
    const query = req.query.query;
    console.log(query);
    if (!query) {
      return res
        .status(400)
        .json({ code: 400, message: '검색어가 필요합니다.' });
    }
    const qnas = await QnA.findAll({
      include: [
        {
          model: User,
          attributes: ['username'],
        },
      ],
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${query}%`,
            },
          },
          {
            content: {
              [Op.like]: `%${query}%`,
            },
          },
          {
            '$User.username$': {
              [Op.like]: `%${query}%`,
            },
          },
        ],
      },
    });

    const formatteQnAs = qnas.map((qna) => {
      return {
        ...qna.toJSON(),
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

// 리뷰 수정
exports.editQnA = async (req, res, next) => {
  try {
    const { qnaId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const qna = await QnA.findByPk(qnaId);
    await verifyPost(qna, userId, 'QnA');

    const [updatedCount] = await QnA.update(updateData, {
      where: { id: qnaId },
      paranoid: false,
    });

    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ code: 404, message: 'QnA 수정 중 오류가 발생했습니다.' });
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

    const qna = await QnA.findByPk(qnaId);
    await verifyPost(qna, userId, 'QnA');

    await qna.destroy();
    return res.status(200).json({ message: 'QnA 삭제에 성공하였습니다.' });
  } catch (error) {
    next(error);
  }
};

// 상세 페이지
exports.getQnA = async (req, res, next) => {
  try {
    const { qnaId } = req.params;
    console.log(qnaId);

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

    // 로그인 사용자 처리
    if (userId) {
      if (!viewedData.qnas[userId]) {
        viewedData.qnas[userId] = {};
      }
      if (!viewedData.qnas[userId][qnaId]) {
        await QnA.increment('hits', { where: { id: qnaId } });
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
        await QnA.increment('hits', { where: { id: qnaId } });
        viewedData.qnas[ipAddress][qnaId] = true;
        res.cookie('viewedData', JSON.stringify(viewedData), {
          maxAge: 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
      }
    }

    const qna = await QnA.findOne({
      where: { id: qnaId },
      include: [
        {
          model: QnAComment,
        },
      ],
    });

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
