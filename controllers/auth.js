const bcrypt = require('bcrypt');
const User = require('../models/mysql/user');
const passport = require('passport');
const dotenv = require('dotenv');
const moment = require('moment-timezone');

const {
  generateAccessToken,
  generateRefreshToken,
  deleteRefreshToken,
} = require('../utils/token');
const { sequelize } = require('../models/mysql');
const { hashPassword } = require('../utils/user');
const handleError = require('../utils/utils');
dotenv.config();

const join = async (req, res, next) => {
  const {
    email: useremail,
    username,
    password: userpassword,
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
    // const exUser = await User.findOne({ where: { email } });
    // if (exUser) {
    //   const error = new Error('현재 사용중인 이메일 입니다.');
    //   error.status = 400
    //   throw error
    // }
    // const passwordHash = await bcrypt.hash(userpassword, 12);
    const passwordHash = await hashPassword(userpassword, 12);

    // const newUser = await User.create({
    //   email: useremail,
    //   username,
    //   password: passwordHash,
    //   logo,
    //   contact,
    //   companyName,
    //   business,
    //   region,
    //   startDate,
    //   isStore,
    //   storeCount,
    //   sales,
    // });

    const userQuery = `select * from users where email = :useremail`;

    const exUser = await sequelize.query(userQuery, {
      replacements: {
        useremail,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    if (exUser.length > 0) {
      return handleError(400, '현재 사용중인 이메일 입니다.', next);
    }

    const formattedStartDate = moment(startDate).format('YYYY-MM-DD HH:mm:ss');

    const createQuery = `INSERT INTO Users (email, username, password, logo, contact, companyName, 
          business, region, startDate, isStore, storeCount, sales, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());`;

    const replacements = [
      useremail,
      username,
      passwordHash,
      logo,
      contact,
      companyName,
      business,
      region,
      formattedStartDate,
      isStore,
      storeCount,
      sales,
    ];

    await sequelize.query(createQuery, {
      replacements,
      type: sequelize.QueryTypes.INSERT,
    });

    return res.status(200).json({ code: 200, message: '회원가입 성공' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const login = async (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return handleError(401, info.message, next);
    }
    try {
      // JWT 토큰 생성
      const payload = { id: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = await generateRefreshToken(user.id);

      // 유저 정보 넘겨줄 때 비밀번호 제외
      // ORM
      // const userWithoutPassword = { ...user.toJSON() };
      // Query
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;

      res.cookie('refreshtoken', refreshToken, {
        maxAge:
          parseInt(process.env.REFRESHTOKEN_EXPIRESIN) * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      return res
        .status(200)
        .json({ accessToken, refreshToken, userWithoutPassword });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  })(req, res, next);
};

const logout = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(' ')[1];
    const refreshToken = req.cookies.refreshtoken;

    // req.body 에 담는거
    // const { refreshToken } = req.body;

    const result = await deleteRefreshToken(refreshToken, accessToken);

    return res
      .status(result.status)
      .json({ code: result.status, message: result.message });
  } catch (error) {
    console.error('Logout failed:', error);
    next(error);
  }
};

// 회원정보 수정
const userUpdate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateUser = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return handleError(404, '해당 유저를 찾지 못했습니다.', next);
    }
    if (updateUser.password) {
      delete updateUser.password;
      delete updateUser.email;
    }
    const [updatedCount] = await User.update(updateUser, {
      where: { id: userId },
      paranoid: false,
    });

    if (updatedCount === 0) {
      return handleError(404, '업데이트할 데이터가 없습니다.', next);
    }
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });
    return res.status(200).json({ code: 200, updatedUser });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const userPasswordChange = async (req, res, next) => {
  try {
    // 유저 찾기
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return handleError(404, '해당 유저를 찾지 못했습니다.', next);
    }
    // 비밀번호 체크

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return handleError(
        404,
        '입력한 현재 비밀번호가 일치하지 않습니다.',
        next
      );
    }
    const passwordHash = await hashPassword(newPassword, 12);

    user.password = passwordHash;
    await user.save();
    return res
      .status(200)
      .json({ code: 200, message: '비밀번호를 성공적으로 변경하였습니다.' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const findUserEmail = async (req, res, next) => {
  try {
    const { username, contact } = req.body;
    const user = await User.findOne({
      where: { username, contact },
    });
    if (!user) {
      return handleError(
        404,
        '해당 유저를 찾지 못하였습니다. 이름 또는 연락처를 확인해주세요.',
        next
      );
    }
    return res
      .status(200)
      .json({ code: 200, message: `회원님의 이메일은 ${user.email} 입니다.` });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const findUserPassword = async (req, res, next) => {
  try {
    const { email, username, contact } = req.body;
    const user = await User.findOne({
      where: { email, username, contact },
    });
    if (!user) {
      return handleError(
        404,
        '해당 유저를 찾지 못하였습니다. 이메일, 이름 또는 연락처를 확인해주세요.',
        next
      );
    }
    return res.status(200).json({
      code: 200,
      message: '비밀번호 재설정 해주세요.',
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    //
    const { userId } = req.params;
    const { password1, password2 } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return handleError(404, '해당 유저를 찾지 못했습니다.', next);
    }
    if (password1 !== password2) {
      return handleError(400, '비밀번호가 일치하지 않습니다.', next);
    }

    const hash = await bcrypt.hash(password1, 12);
    user.password = hash;
    await user.save();

    return res
      .status(200)
      .json({ code: 200, message: '비밀번호를 성공적으로 변경하였습니다.' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await User.destroy({ where: { id: userId } });
    return res
      .status(200)
      .json({ code: 200, message: '회원탈퇴가 완료되었습니다.' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = {
  join,
  login,
  logout,
  userUpdate,
  userPasswordChange,
  findUserEmail,
  findUserPassword,
  resetPassword,
  deleteUser,
};
