const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const blackListSchema = require('../models/mongo/blacklist');
const Foundation = require('../models/mysql/foundation');
const handleError = require('../utils/utils');

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
const handleTokenError = (error, res, next) => {
  if (error.name === 'TokenExpiredError') {
    const errors = new Error('토큰이 만료되었습니다.');
    errors.status = 419;
    return next(errors);
  }
  const errors = new Error('유효하지 않은 토큰입니다.');
  errors.status = 401;
  return next(errors);
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
      return handleTokenError(error, res, next);
    }
  };
};

const isAuthorOrAdmin = async (req, res, next) => {
  const { foundationId } = req.params;

  const userId = req.user.id;

  try {
    const foundation = await Foundation.findOne({
      where: { id: foundationId },
    });

    if (!foundation) {
      return handleError(404, '해당 글을 찾을 수 없습니다.');
    }

    if (foundation.writer !== userId && req.user.role !== 'admin') {
      return handleError(403, '접근 권한이 없습니다.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// export 모듈
module.exports = {
  verifyToken: verifyToken(true, true), // 블랙리스트 체크와 함께 검증 수행
  isNotLoggedIn,
  isLoggedIn: verifyToken(false, false), // 블랙리스트 체크 없이 로그인 검증만 수행
  notUser: verifyToken(false, false),
  isAuthorOrAdmin,
};
