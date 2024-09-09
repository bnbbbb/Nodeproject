const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const refreshTokenSchema = require('../models/mongo/token');
const blackListSchema = require('../models/mongo/blacklist');
const User = require('../models/mysql/user');
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

// TODO accessToken 재발급
const refreshAccessToken = async (req, res, next) => {
  try {
    // body값으로
    // const refreshToken = req.body.refreshToken;
    // cookies값으로
    const refreshToken = req.cookies.refreshtoken;
    console.log(req.cookies);
    if (!refreshToken) {
      return res.status(400).json({
        code: 400,
        message: 'RefreshToken 이 필요합니다.',
      });
    }

    const existingRefToken = await refreshTokenSchema.findOne({
      token: refreshToken,
    });
    const userId = existingRefToken.userId;
    if (!existingRefToken) {
      return res.status(401).json({
        code: 401,
        message: 'refresh token이 유효하지 않습니다.',
      });
    }
    const user = await User.findOne({ where: { id: userId } });
    const useremail = user.email;
    const payload = { id: userId, email: useremail };
    const newAccessToken = generateAccessToken(payload);

    return res.status(200).json({
      code: 200,
      message: newAccessToken,
    });
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
