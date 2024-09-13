const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'My API',
    description: 'API Documentation',
  },
  host: 'localhost:8080',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      in: 'header',
      bearerFormat: 'JWT',
    },
  },
};

const outputFile = './swagger-output.json'; // 출력 파일
// const endpointsFiles = ['../routes/auth.js']; // 엔드포인트 파일
const endpointsFiles = [
  '../routes/auth.js',
  '../routes/comment.js',
  '../routes/consult.js',
  '../routes/qna.js',
  '../routes/review.js',
  '../routes/foundation.js',
];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require('../app'); // 서버 시작
});
