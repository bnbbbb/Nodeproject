const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const refreshTokenSchema = require('../models/mongo/token');
const blackListSchema = require('../models/mongo/blacklist');

dotenv.config();

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET_KEY, {
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
    console.error('Failed to generate and store refresh token:', error);
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

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(404)
      .json({ code: 404, message: 'Authorization이 비어있습니다.' });
  }
  const accessToken = authHeader.split(' ')[1];

  try {
    const isBlacklisted = await blackListSchema.findOne({ token: accessToken });
    if (isBlacklisted) {
      return res.status(401).json({
        code: 401,
        message: 'acessToken이 이미 블랙리스트에 등록되어있습니다.',
      });
    }
    res.locals.decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
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

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  deleteRefreshToken,
};
