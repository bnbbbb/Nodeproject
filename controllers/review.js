const { Op } = require('sequelize');
const { Review, review, Consult } = require('../models/mysql/category');
const User = require('../models/mysql/user');
const pool = require('../utils/sql');
const jwt = require('jsonwebtoken');
const { ReviewComment } = require('../models/mysql/comment');
const moment = require('moment-timezone');
const { verifyPost } = require('../utils/postUtils');
const { sequelize } = require('../models/mysql');

// 리뷰 관련 메소드
exports.createReview = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    // ORM
    // const review = await Review.create({
    //   //verifyToken으로 userId 전달
    //   review_writer: req.user.id,
    //   title,
    //   content,
    // });
    // return res.status(200).json({ code: 200, review });

    // Query
    const query = `
      INSERT INTO reviews (writer, title, content, createdAt, updatedAt) 
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    const reviews = await sequelize.query(query, {
      replacements: [userId, title, content], // 세 개의 값을 전달
      type: sequelize.QueryTypes.INSERT,
    });

    return res
      .status(201)
      .json({ code: 201, message: '리뷰가 성공적으로 생성되었습니다.' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 전체 리뷰 보기
// TODO 사용자 이름도 같이
exports.reviewList = async (req, res, next) => {
  try {
    // const reviews = await Review.findAll();

    // ORM
    // const formattedReviews = reviews.map((review) => {
    //   return {
    //     ...review.toJSON(),
    //     createdAt: moment(review.createdAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //     updatedAt: moment(review.updatedAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //   };
    // });

    // SQL Query
    const reviewQuery = `
      SELECT id, title, content, hits, createdAt, updatedAt, deletedAt, writer
      FROM reviews
      WHERE deletedAt IS NULL
    `;
    const reviews = await sequelize.query(reviewQuery, {
      type: sequelize.QueryTypes.SELECT,
    });

    const formattedReviews = reviews.map((review) => {
      return {
        ...review,
        createdAt: moment(review.createdAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(review.updatedAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
      };
    });

    return res.status(200).json({ code: 200, formattedReviews });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 내가 쓴 리뷰 보기
exports.myReviewList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // const reviews = await Review.findAll({
    //   where: { review_writer: userId },
    // });

    // // 한국 시간으로 출력
    // const formattedReviews = reviews.map((review) => {
    //   return {
    //     ...review.toJSON(),
    //     createdAt: moment(review.createdAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //     updatedAt: moment(review.updatedAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //   };
    // });

    // Query
    const query = `
      SELECT id, title, content, hits, createdAt, updatedAt, deletedAt, writer
      FROM reviews
      WHERE deletedAt IS NULL AND writer = ?
    `;

    const reviews = await sequelize.query(query, {
      // bind: [userId],
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT,
    });
    const formattedReviews = reviews.map((review) => {
      return {
        ...review,
        createdAt: moment(review.createdAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(review.updatedAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
      };
    });

    return res.status(200).json({ code: 200, formattedReviews });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 검색한 리뷰 보기
exports.searchReview = async (req, res, next) => {
  try {
    const searchQuery = req.query.query;
    if (!searchQuery) {
      const error = new Error('검색어가 필요합니다.');
      error.status = 400;
      throw error;
    }
    // ORM

    // const reviews = await Review.findAll({
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
    // const formattedReviews = reviews.map((review) => {
    //   return {
    //     ...review.toJSON(),
    //     createdAt: moment(review.createdAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //     updatedAt: moment(review.updatedAt)
    //       .tz('Asia/Seoul')
    //       .format('YYYY-MM-DD HH:mm:ss'),
    //   };
    // });

    // Query

    const query = `select r.* from reviews as r
    join users as u on r.writer = u.id
    where r.title like :query
    or r.content like :query
    or u.username like :query
    `;
    const queryParam = `%${searchQuery}%`;
    const reviews = await sequelize.query(query, {
      replacements: { query: queryParam },
      type: sequelize.QueryTypes.SELECT,
    });

    const formattedReviews = reviews.map((review) => {
      return {
        ...review,
        createdAt: moment(review.createdAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(review.updatedAt)
          .tz('Asia/Seoul')
          .format('YYYY-MM-DD HH:mm:ss'),
      };
    });

    return res.status(200).json({ code: 200, formattedReviews });
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
    const userId = req.user.id;

    // ORM
    // const review = await Review.findByPk(reviewId);
    // await verifyPost(review, userId, '리뷰');
    // const [updatedCount] = await Review.update(updateData, {
    //   where: { id: reviewId },
    //   paranoid: false,
    // });

    // Query
    const findQuery = `
    select *
    from reviews
    where id = :reviewId`;
    const [review] = await sequelize.query(findQuery, {
      replacements: { reviewId },
      type: sequelize.QueryTypes.SELECT,
    });

    await verifyPost(review, userId, '리뷰');
    const title = updateData.title || review.title;
    const content = updateData.content || review.content;

    const updateQuery = `
      UPDATE reviews
      SET title = :title,
        content = :content,
        updatedAt = NOW()
      WHERE id = :reviewId
    `;

    const [updatedCount] = await sequelize.query(updateQuery, {
      replacements: {
        title,
        content,
        reviewId,
      },
      type: sequelize.QueryTypes.UPDATE,
    });

    if (updatedCount === 0) {
      return res
        .status(500)
        .json({ code: 500, message: '리뷰 수정 중 오류가 발생했습니다.' });
    }

    const updateReview = await Review.findByPk(reviewId);

    return res.status(200).json({ code: 200, message: updateReview });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 삭제
exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // ORM
    // const review = await review.findByPk(reviewId);
    // await verifyPost(review, userId, '리뷰');
    // await review.destroy();

    // Query
    const findQuery = `
    select *
    from reviews
    where id = :reviewId`;
    const [review] = await sequelize.query(findQuery, {
      replacements: { reviewId },
      type: sequelize.QueryTypes.SELECT,
    });
    console.log(review);

    await verifyPost(review, userId, 'review');

    const deleteQuery = `
    delete from reviews where id = :reviewId`;

    await sequelize.query(deleteQuery, {
      replacements: { reviewId },
      type: sequelize.QueryTypes.DELETE,
    });

    return res.status(200).json({ message: '리뷰 삭제에 성공하였습니다.' });
  } catch (error) {
    next(error);
  }
};

// 상세 페이지
exports.getReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

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

    viewedData.reviews = viewedData.reviews || {};

    // 로그인 사용자 처리
    if (userId) {
      if (!viewedData.reviews[userId]) {
        viewedData.reviews[userId] = {};
      }
      if (!viewedData.reviews[userId][reviewId]) {
        await Review.increment('hits', { where: { id: reviewId } });
        viewedData.reviews[userId][reviewId] = true;
        res.cookie('viewedData', JSON.stringify(viewedData), {
          maxAge: 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
      }
    }

    // 비로그인 사용자 처리
    else {
      const ipAddress = req.ip;
      if (!viewedData.reviews[ipAddress]) {
        viewedData.reviews[ipAddress] = {};
      }
      if (!viewedData.reviews[ipAddress][reviewId]) {
        await Review.increment('hits', { where: { id: reviewId } });
        viewedData.reviews[ipAddress][reviewId] = true;
        res.cookie('viewedData', JSON.stringify(viewedData), {
          maxAge: 24 * 60 * 60 * 1000,
          httpOnly: true,
        });
      }
    }

    const review = await Review.findOne({
      where: { id: reviewId },
      include: [
        {
          model: ReviewComment,
        },
      ],
    });

    const formattedReview = {
      ...review.toJSON(),
      createdAt: moment(review.createdAt)
        .tz('Asia/Seoul')
        .format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment(review.updatedAt)
        .tz('Asia/Seoul')
        .format('YYYY-MM-DD HH:mm:ss'),
    };

    return res.status(200).json({ code: 200, message: formattedReview });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
