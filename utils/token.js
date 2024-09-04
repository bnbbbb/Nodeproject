const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const refreshTokenSchema = require('../models/mongo/token');
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

const verifyToken = (token, key = process.env.SECRET_KEY) => {
  return jwt.verify(token, key);
};

const verifyAccessToken = (accessToken) => {};

const deleteRefreshToken = async (refreshToken) => {
  try {
    const result = await refreshTokenSchema.findOne({ token: refreshToken });

    if (!result) {
      // Token not found
      return { status: 404, message: 'Refresh token을 찾을 수 없습니다.' };
    }

    // Token found, proceed to delete
    await refreshTokenSchema.deleteOne({ token: refreshToken });

    return { status: 200, message: 'RefreshToken 삭제 성공' };
  } catch (error) {
    console.error('Failed to delete refresh token:', error);
    return { status: 500, message: 'Internal Server Error' };
  }
};

const blackListActToken = (accessToken) => {
  try {
    // TODO accessToken 유효성 검사
    // const accessTokenIsValid = ve
  } catch (error) {}
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  deleteRefreshToken,
};
