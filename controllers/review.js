const { Review } = require('../models/mysql/category');
const User = require('../models/mysql/user');
const { ReviewComment } = require('../models/mysql/comment');
const moment = require('moment-timezone');
const { verifyPost } = require('../utils/postUtils');
const { sequelize } = require('../models/mysql');
const requestIp = require('request-ip');
const hitsPost = require('../utils/hitsPost');
const { groupedData } = require('../utils/commentUtils');
const handleError = require('../utils/utils');

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
      select r.id, r.title, r.content, r.hits, r.createdAt,
      r.updatedAt, r.deletedAt, r.writer, u.username, u.contact
      from reviews as r
      join users as u on r.writer = u.id
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
    console.error(error);
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
      select r.id, r.title, r.content, r.hits, r.createdAt,
      r.updatedAt, r.deletedAt, r.writer, u.username, u.contact
      from reviews as r
      join users as u on r.writer = u.id
      WHERE writer = ?
    `;

    const reviews = await sequelize.query(query, {
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
  const transaction = await sequelize.transaction();

  try {
    const { reviewId } = req.params;
    const reviewQueryFirst = `
      select * from reviews
      where id = ?
      `;
    const reviewFirst = await sequelize.query(reviewQueryFirst, {
      replacements: [reviewId],
      type: sequelize.QueryTypes.SELECT,
    });

    if (reviewFirst.length < 1)
      return handleError(404, '해당 리뷰내역이 존재하지 않습니다.');

    let userId = req.user ? req.user.id : null;

    let userIp = requestIp.getClientIp(req);

    if (userIp.startsWith('::ffff:')) {
      userIp = userIp.slice(7);
    }

    // const hits = await hitsPost(reviewId, userIp, 'review', { transaction });
    const hits = await hitsPost.createHitPost(reviewId, userIp, 'Review');

    if (hits) {
      const reviewUpdateQuery = `
        update reviews
        set hits = hits + 1
        where id = ?
      `;
      const reviewUpdate = await sequelize.query(reviewUpdateQuery, {
        replacements: [reviewId],
        type: sequelize.QueryTypes.UPDATE,
        transaction,
      });

      await transaction.commit();
    }

    const reviewQuery = `
      SELECT r.id AS reviewId, r.title, r.content, r.hits, r.createdAt AS reviewCreatedAt, r.writer,
      c.id AS commentId, c.comment, c.createdAt AS commentCreatedAt, c.commenter
      FROM reviews AS r
      LEFT JOIN review_comments AS c ON c.review_id = r.id
      WHERE r.id = ?;
      `;
    const review = await sequelize.query(reviewQuery, {
      replacements: [reviewId],
      type: sequelize.QueryTypes.SELECT,
    });

    const reviewGroup = groupedData(review, 'review');

    return res.status(200).json({ code: 200, reviewGroup });
  } catch (error) {
    await transaction.rollback();

    console.error(error);
    next(error);
  }
};
