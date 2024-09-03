const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.secretKey, { expiresIn: '1m' });
};

const generateRefreshToken = () => {
  return jwt.sign({}, process.env.secretKey, { expiresIn: '1d' });
};

const verifyToken = (token, key = secretKey) => {
  return jwt.verify(token, key);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
