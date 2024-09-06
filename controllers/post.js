const { Op } = require('sequelize');
const { Review, QnA, Consult } = require('../models/mysql/post');
const User = require('../models/mysql/user');
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
    const userId = req.user.ㅇid;
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
