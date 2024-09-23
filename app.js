const express = require('express');
const path = require('path');
const passport = require('passport');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { sequelize } = require('./models/mysql');
// 스웨거
// const { swaggerUi } = require('./swagger/swagger');
const swaggerUi = require('swagger-ui-express');
// const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger-output.json'); // 생성된 파일 가져오기

dotenv.config();
const authRouter = require('./routes/auth');
const reviewRouter = require('./routes/review');
const qnaRouter = require('./routes/qna');
const consultRouter = require('./routes/consult');
const commentRouter = require('./routes/comment');
const foundationRouter = require('./routes/foundation');
const adminFdRouter = require('./routes/admin/foundation');
const presentationRouter = require('./routes/admin/presentation');
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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use('', authRouter);
app.use('', reviewRouter);
app.use('', qnaRouter);
app.use('', consultRouter);
app.use('', commentRouter);
app.use('', foundationRouter);
app.use('', presentationRouter);

// admin
app.use('/api/foundation', adminFdRouter);

// app.use('/api/auth', authRouter);
// app.use('/api/review', reviewRouter);
// app.use('/api/qna', qnaRouter);
// app.use('/api/consult', consultRouter);
// app.use('/api/comment', commentRouter);
// app.use('/api/foundation', foundationRouter);
// app.use('/api/foundation', adminFdRouter);

// app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};

  const status = err.status || 500;
  console.error('err', err);

  res.status(status).json({
    code: status,
    error: err.message || '서버에서 오류가 발생했습니다.',
  });
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});
