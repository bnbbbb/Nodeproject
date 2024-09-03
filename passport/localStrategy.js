const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const User = require('../models/user');

// const opts = {
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//   secretOrKey: secretKey,
// };

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email', // 사용자 이름으로 사용할 필드 (여기서는 이메일)
        passwordField: 'password', // 비밀번호로 사용할 필드
      },
      async (email, password, done) => {
        try {
          // 이메일로 사용자 검색
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            // 입력된 비밀번호와 저장된 비밀번호를 비교
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
              // 비밀번호가 맞으면 사용자 정보를 done으로 전달
              done(null, exUser);
            } else {
              // 비밀번호가 일치하지 않으면 에러 메시지와 함께 done 호출
              done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
          } else {
            // 사용자가 존재하지 않으면 에러 메시지와 함께 done 호출
            done(null, false, { message: '해당 유저가 존재하지 않습니다.' });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
