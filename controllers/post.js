const { Op } = require('sequelize');
const { Review, QnA, Consult } = require('../models/mysql/post');
const User = require('../models/mysql/user');
const pool = require('../utils/sql');
const jwt = require('jsonwebtoken');

// 리뷰 관련 메소드

exports.createReview = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const review = await Review.create({
      //verifyToken으로 userId 전달
      review_writer: req.user.id,
      title,
      content,
    });
    return res.status(200).json({ code: 200, review });

    // 임시 SQL 적용 코드 - 작동x
    // const sql =
    //   'INSERT INTO reviews (review_writer, title, content) VALUES (?, ?, ?)';
    // const [result] = await pool.query(sql, [req.user.id, title, content]);
    // const reviewId = result.insertId;
    // return res.status(200).json({
    //   code: 200,
    //   review: { id: reviewId, review_writer: req.user.id, title, content },
    // });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 전체 리뷰 보기
exports.reviewList = async (req, res, next) => {
  try {
    const reviews = await Review.findAll();
    return res.status(200).json({ code: 200, reviews });
  } catch (error) {
    console.log(error);
    // return res.status(500).json({ code: 500, message: error.message });
    next(error);
  }
};

// 내가 쓴 리뷰 보기
exports.myReviewList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reviews = await Review.findAll({
      where: { review_writer: userId },
    });
    return res.status(200).json({ code: 200, reviews });
  } catch (error) {
    console.error(error);
    // return res
    //   .status(500)
    //   .json({ code: 500, message: '서버 오류가 발생했습니다.' });
    next(error);
  }
};

// 검색한 리뷰 보기
exports.searchReivew = async (req, res, next) => {
  try {
    const query = req.query.query;
    console.log(query);
    if (!query) {
      return res
        .status(400)
        .json({ code: 400, message: '검색어가 필요합니다.' });
    }
    const reviews = await Review.findAll({
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
    return res.status(200).json({ code: 200, reviews });
  } catch (error) {
    console.error('Error:', error); // 오류 로그
    return res.status(400).json({ code: 400, message: error.message });
  }
};

// 리뷰 수정
exports.editReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const updateData = req.body;

    const [updatedRowsCount] = await Review.update(updateData, {
      where: { id: reviewId },
      paranoid: false,
    });

    if (updatedRowsCount === 0) {
      return res
        .status(404)
        .json({ code: 404, message: '해당 리뷰를 찾지 못했습니다.' });
    }

    const updateReview = await Review.findByPk(reviewId);

    return res.status(200).json({ code: 200, message: updateReview });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 상세 페이지
exports.getReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    // 조회수
    const jwtCookie = req.cookies.jwt; // 쿠키에서 JWT 추출
    console.log(jwtCookie);
    const decoded = jwt.verify(jwtCookie, process.env.SECRET_KEY);

    console.log(decoded);
    const userId = decoded.id;
    if (!userId) {
      return res
        .status(401)
        .json({ code: 401, message: 'User not authenticated' });
    }
    console.log(2);
    const viewedReviews = req.cookies.viewedReviews || {};
    console.log(3);
    if (!viewedReviews[reviewId]) {
      // 중복 조회가 아니라면, 조회수 증가 및 쿠키에 기록 추가
      await Review.increment('hits', { where: { id: reviewId } });

      viewedReviews[reviewId] = true;
      res.cookie('viewedReviews', JSON.stringify(viewedReviews), {
        // 쿠키 만료 시간 설정 (24시간)
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
    }

    const review = await Review.findOne({
      where: { id: reviewId },
    });
    return res.status(200).json({ code: 200, message: review });
  } catch (error) {}
};
