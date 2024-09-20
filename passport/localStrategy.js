const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/mysql/user');
const { sequelize } = require('../models/mysql');

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email', // 사용자 이름으로 사용할 필드 (여기서는 이메일)
        passwordField: 'password', // 비밀번호로 사용할 필드
      },
      async (email, password, done) => {
        try {
          // const user = await User.findOne({ where: { email } });

          const userQuery = `select * from users where email = :email`;
          const [user] = await sequelize.query(userQuery, {
            replacements: {
              email,
            },
            type: sequelize.QueryTypes.SELECT,
          });

          if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
              return done(null, user); // 사용자 인증 성공
            } else {
              return done(null, false, {
                message: '비밀번호가 일치하지 않습니다.',
              });
            }
          } else {
            return done(null, false, {
              message: '해당 유저가 존재하지 않습니다.',
            });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  //
};
