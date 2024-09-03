const express = require('express');
const path = require('path');
const passport = require('passport');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

dotenv.config();
const authRouter = require('./routes/auth');
// const passportConfig = require('./passport/jwtStrategy');

const app = express();
// passportConfig();

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

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(passport.initialize());

app.use('/api/auth', authRouter);

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
  res.json({ code: err.status || 500, error: err.message });
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});
