const express = require('express');
const path = require('path');
const passport = require('passport');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { sequelize } = require('./models/mysql');

dotenv.config();
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const connection = require('./models/mongo/connection');
const passportConfig = require('./passport');
// 조회수
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
//
const app = express();

app.set('port', process.env.PORT || 8080);

sequelize
  .sync({
    force: false,
  })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });
connection();

// 조회수
app.use(cookieParser());
//

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
passportConfig();
app.use(passport.initialize());

app.use('/api/auth', authRouter);
app.use('/api/post', postRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  console.error(err);
  // res.json({ code: err.status || 500, error: err.message });
  res.status(500).json({ code: 500, message: '서버 오류가 발생했습니다.' });
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});
