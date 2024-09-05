const bcrypt = require('bcrypt');
const User = require('../models/mysql/user');
const passport = require('passport');
const {
  generateAccessToken,
  generateRefreshToken,
  deleteRefreshToken,
} = require('../utils/token');
const RefreshTokenSchema = require('../models/mongo/token');

exports.join = async (req, res, next) => {
  const {
    email,
    username,
    password,
    logo,
    contact,
    companyName,
    business,
    region,
    startDate,
    isStore,
    storeCount,
    sales,
  } = req.body;

  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res
        .status(400)
        .json({ code: 404, error: 'Email already in use.' });
    }
    const hash = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email,
      username,
      password: hash,
      logo,
      contact,
      companyName,
      business,
      region,
      startDate,
      isStore,
      storeCount,
      sales,
    });
    return res.status(200).json({ code: 200, user: newUser });
  } catch (error) {
    console.error(error);
    // next(error);
    return res.status(500).json(error);
  }
};

exports.login = async (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ code: 400, message: info.message });
    }
    try {
      // JWT 토큰 생성
      const payload = { id: user.id, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = await generateRefreshToken(user.id);

      // 성공 응답
      return res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  })(req, res, next);
};

exports.logout = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(' ')[1];
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        code: 400,
        message: 'Refresh token을 requestbody에 담아주세요',
      });
    }

    const result = await deleteRefreshToken(refreshToken, accessToken);

    return res
      .status(result.status)
      .json({ code: result.status, message: result.message });
  } catch (error) {
    console.error('Logout failed:', error);
    return res
      .status(500)
      .json({ code: 500, message: 'Internal Server Error' });
  }
};
