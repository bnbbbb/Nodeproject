const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const blackListSchema = require('../models/mongo/blacklist');

dotenv.config();

const verifyToken = (required = true, checkBlacklist = false) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      if (required) {
        return res.status(401).json({
          code: 401,
          message: '로그인이 필요합니다. AccessToken이 비어 있습니다.',
        });
      } else {
        return next();
      }
    }
    const accessToken = authHeader.split(' ')[1];

    try {
      // 블랙리스트 체크 확인
      if (checkBlacklist) {
        const isBlacklisted = await blackListSchema.findOne({
          token: accessToken,
        });
        if (isBlacklisted) {
          return res.status(401).json({
            code: 401,
            message: 'accessToken이 이미 블랙리스트에 등록되어 있습니다.',
          });
        }
      }

      // 토큰 검증
      const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
      req.user = decoded;
      res.locals.decoded = decoded;
      return next();
    } catch (error) {
      console.log(error);
      if (error.name === 'TokenExpiredError') {
        return res.status(419).json({
          code: 419,
          message: '토큰이 만료되었습니다.',
        });
      }
      return res.status(401).json({
        code: 401,
        message: '유효하지 않은 토큰입니다.',
      });
    }
  };
};

const isNotLoggedIn = (req, res, next) => {
  if (!req.headers.authorization?.split(' ')[1]) {
    next();
  } else {
    res.status(403).json({ code: 403, message: '로그인한 상태입니다.' });
  }
};

const isLoggedIn = verifyToken(false, false); // 블랙리스트 체크 없이 로그인 검증만 수행
const notUser = verifyToken(false, false);
module.exports = {
  verifyToken: verifyToken(true, true), // 블랙리스트 체크와 함께 검증 수행
  isNotLoggedIn,
  isLoggedIn,
  notUser,
};
