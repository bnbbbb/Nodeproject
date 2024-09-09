const { Op } = require('sequelize');
const { Consult } = require('../models/mysql/post');
const User = require('../models/mysql/user');
const pool = require('../utils/sql');
const jwt = require('jsonwebtoken');

// 리뷰 관련 메소드

exports.createConsult = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const consult = await Consult.create({
      //verifyToken으로 userId 전달
      consult_writer: req.user.id,
      title,
      content,
    });
    return res.status(200).json({ code: 200, consult });

    // 임시 SQL 적용 코드 - 작동x
    // const sql =
    //   'INSERT INTO consults (consult_writer, title, content) VALUES (?, ?, ?)';
    // const [result] = await pool.query(sql, [req.user.id, title, content]);
    // const consultId = result.insertId;
    // return res.status(200).json({
    //   code: 200,
    //   consult: { id: consultId, consult_writer: req.user.id, title, content },
    // });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 전체 리뷰 보기
exports.consultList = async (req, res, next) => {
  try {
    const consults = await Consult.findAll();
    return res.status(200).json({ code: 200, consults });
  } catch (error) {
    console.log(error);
    // return res.status(500).json({ code: 500, message: error.message });
    next(error);
  }
};

// 내가 쓴 리뷰 보기
exports.myConsultList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const consults = await Consult.findAll({
      where: { consult_writer: userId },
    });
    return res.status(200).json({ code: 200, consults });
  } catch (error) {
    console.error(error);
    // return res
    //   .status(500)
    //   .json({ code: 500, message: '서버 오류가 발생했습니다.' });
    next(error);
  }
};

// 검색한 리뷰 보기
exports.searchConsult = async (req, res, next) => {
  try {
    const query = req.query.query;
    console.log(query);
    if (!query) {
      return res
        .status(400)
        .json({ code: 400, message: '검색어가 필요합니다.' });
    }
    const consults = await Consult.findAll({
      include: [
        {
          model: User, // User 모델을 포함
          attributes: ['username'], // 사용자 이름만 가져오기
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
    return res.status(200).json({ code: 200, consults });
  } catch (error) {
    console.error('Error:', error); // 오류 로그
    return res.status(400).json({ code: 400, message: error.message });
  }
};

// 리뷰 수정
exports.editConsult = async (req, res, next) => {
  try {
    const { consultId } = req.params;
    const updateData = req.body;

    const [updatedRowsCount] = await consult.update(updateData, {
      where: { id: consultId },
      paranoid: false,
    });

    if (updatedRowsCount === 0) {
      return res
        .status(404)
        .json({ code: 404, message: '해당 리뷰를 찾지 못했습니다.' });
    }

    const updateConsult = await Consult.findByPk(consultId);

    return res.status(200).json({ code: 200, message: updateConsult });
  } catch (error) {
    console.error(error);
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

    console.log(viewedData);
    const consult = await Consult.findOne({
      where: { id: consultId },
    });

    return res.status(200).json({ code: 200, message: consult });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ code: 500, message: '서버 오류가 발생했습니다.' });
  }
};
