const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const refreshTokenSchema = require('../models/mongo/token');
const blackListSchema = require('../models/mongo/blacklist');
const User = require('../models/mysql/user');
const handleError = require('./utils');
dotenv.config();

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET_KEY, {
    algorithm: 'HS256',
    expiresIn: process.env.ACCESSTOKEN_EXPIRESIN,
  });
};

const generateRefreshToken = async (userId) => {
  try {
    const refToken = jwt.sign({}, process.env.SECRET_KEY, {
      expiresIn: process.env.REFRESHTOKEN_EXPIRESIN,
    });
    const expiresAt = new Date();
    expiresAt.setTime(
      expiresAt.getTime() +
        parseInt(process.env.REFRESHTOKEN_EXPIRESIN) * 24 * 60 * 60 * 1000
    );
    await refreshTokenSchema.create({
      token: refToken,
      userId: userId,
      expiresAt: expiresAt,
    });
    return refToken;
  } catch (error) {
    console.error('Refresh token 생성 및 저장 실패:', error);
    throw error;
  }
};

const blackListActToken = async (accessToken) => {
  try {
    // TODO accessToken 유효성 검사
    const tokenExists = await blackListSchema.findOne({ token: accessToken });
    if (!tokenExists) {
      await blackListSchema.create({ token: accessToken });
    }
  } catch (error) {
    console.error('blacklist에 accesstoken 추가를 실패하였습니다.', error);
    throw error;
  }
};

const deleteRefreshToken = async (refreshToken, accessToken) => {
  try {
    const result = await refreshTokenSchema.findOne({ token: refreshToken });
    blackListActToken(accessToken);
    if (!result) {
      return { status: 404, message: 'Refresh token을 찾을 수 없습니다.' };
    }
    await refreshTokenSchema.deleteOne({ token: refreshToken });

    return { status: 200, message: 'RefreshToken 삭제 성공' };
  } catch (error) {
    console.error('Failed to delete refresh token:', error);
    return { status: 500, message: 'Internal Server Error' };
  }
};

// refreshToken을 가져오는 함수
const getRefreshToken = (req) => {
  const refreshToken = req.cookies.refreshtoken; // 쿠키에서 가져오기
  // const refreshToken = req.body.refreshToken; // body에서 가져오기
  if (!refreshToken) {
    const error = new Error('RefreshToken 이 필요합니다.');
    error.status = 400;
    throw error;
  }
  return refreshToken;
};

// refreshToken을 검증하는 함수
const validateRefreshToken = async (refreshToken) => {
  const existingRefToken = await refreshTokenSchema.findOne({
    token: refreshToken,
  });
  if (!existingRefToken) {
    const error = new Error('refresh token이 유효하지 않습니다.');
    error.status = 401;
    throw error;
  }
  return existingRefToken.userId;
};

// 사용자 정보를 조회하는 함수
const findUserById = async (userId) => {
  const user = await User.findOne({ where: { id: userId } });
  if (!user) {
    const error = new Error('사용자를 찾을 수 없습니다.');
    error.status = 404;
    throw error;
  }
  return user;
};

// 새로운 access token을 생성하는 함수
const createNewAccessToken = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  return generateAccessToken(payload);
};

// 응답을 반환하는 함수
const sendAccessTokenResponse = (res, token) => {
  return res.status(200).json({
    code: 200,
    message: token,
  });
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = getRefreshToken(req);
    const userId = await validateRefreshToken(refreshToken);
    const user = await findUserById(userId);
    const newAccessToken = createNewAccessToken(user);
    sendAccessTokenResponse(res, newAccessToken);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  deleteRefreshToken,
  refreshAccessToken,
};
