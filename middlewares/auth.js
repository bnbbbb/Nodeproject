const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const blackListSchema = require('../models/mongo/blacklist');

dotenv.config();

// Authorization 헤더에서 AccessToken 추출
const getAccessToken = (req, required) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    if (required) {
      const error = new Error(
        '로그인이 필요합니다. AccessToken이 비어 있습니다.'
      );
      error.status = 401;
      throw error;
    }
    return null;
  }
  return authHeader.split(' ')[1];
};

// 블랙리스트에 등록된 토큰인지 확인
const checkBlacklist = async (accessToken) => {
  const isBlacklisted = await blackListSchema.findOne({ token: accessToken });

  if (isBlacklisted) {
    const error = new Error(
      'accessToken이 이미 블랙리스트에 등록되어 있습니다.'
    );
    error.status = 401;
    throw error;
  }
};

// AccessToken 검증 및 디코딩
const verifyAccessToken = (accessToken) => {
  return jwt.verify(accessToken, process.env.SECRET_KEY);
};

// 토큰 관련 에러 처리
const handleTokenError = (error, res) => {
  console.log(error);
  if (error.name === 'TokenExpiredError') {
    const errors = new Error('토큰이 만료되었습니다.');
    errors.status = 419;
    throw errors;
  }
  const errors = new Error('유효하지 않은 토큰입니다.');
  errors.status = 401;
  throw errors;
};

// isNotLoggedIn: 로그인 여부 확인
const isNotLoggedIn = (req, res, next) => {
  const accessToken = getAccessToken(req, false);
  if (!accessToken) {
    next();
  } else {
    const error = new Error('로그인한 상태입니다.');
    error.status = 403;
    throw error;
  }
};

// 메인 검증 미들웨어
const verifyToken = (required = true, shouldcheckBlacklist = false) => {
  return async (req, res, next) => {
    try {
      const accessToken = getAccessToken(req, required);
      if (!accessToken) return next();

      if (shouldcheckBlacklist) {
        await checkBlacklist(accessToken);
      }

      const decoded = verifyAccessToken(accessToken);
      req.user = decoded;
      res.locals.decoded = decoded;
      return next();
    } catch (error) {
      return handleTokenError(error, res);
    }
  };
};

// export 모듈
module.exports = {
  verifyToken: verifyToken(true, true), // 블랙리스트 체크와 함께 검증 수행
  isNotLoggedIn,
  isLoggedIn: verifyToken(false, false), // 블랙리스트 체크 없이 로그인 검증만 수행
  notUser: verifyToken(false, false),
};
