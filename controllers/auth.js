const bcrypt = require('bcrypt');
const User = require('../models/user');
const passport = require('passport');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
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
  try {
    const { email, password } = req.body;

    // 이메일로 사용자 검색
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ code: 400, error: 'User not found' });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ code: 400, error: 'Invalid credentials' });
    }

    // JWT 토큰 생성
    const payload = { id: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken();

    // TODO Ref Token 레디스 or 몽고디비에 저장

    // Refresh Token을 쿠키로 전달
    // res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    // 성공 응답
    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.logout = async (req, res, next) => {
  req.logout(() => {
    res.status(200).json({ code: 200, message: '로그아웃 성공' });
  });
};
