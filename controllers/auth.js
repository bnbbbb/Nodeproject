const bcrypt = require('bcrypt');
const User = require('../models/mysql/user');
const passport = require('passport');
const dotenv = require('dotenv');

const {
  generateAccessToken,
  generateRefreshToken,
  deleteRefreshToken,
} = require('../utils/token');

dotenv.config();

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

      res.cookie('refreshtoken', refreshToken, {
        maxAge:
          parseInt(process.env.REFRESHTOKEN_EXPIRESIN) * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

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
    const refreshToken = req.cookies.refreshtoken;
    if (!refreshToken) {
      return res.status(400).json({
        code: 400,
        message: 'RefreshToken이 쿠키에 없습니다. ',
      });
    }
    // req.body 에 담는거
    // const { refreshToken } = req.body;
    // if (!refreshToken) {
    //   return res.status(400).json({
    //     code: 400,
    //     message: 'Refresh token을 requestbody에 담아주세요',
    //   });
    // }

    const result = await deleteRefreshToken(refreshToken, accessToken);

    return res
      .status(result.status)
      .json({ code: result.status, message: result.message });
  } catch (error) {
    console.error('Logout failed:', error);
    next(error);
  }
};

// TODO 회원정보 수정
exports.userUpdate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateUser = req.body;
    const [updatedCount] = await User.update(updateUser, {
      where: { id: userId },
      paranoid: false,
    });

    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ code: 404, message: '해당 유저를 찾지 못했습니다.' });
    }
    const updatedUser = await User.findByPk(userId);
    return res.status(200).json({ code: 200, updatedUser });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
