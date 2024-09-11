const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// 이메일 전송을 위한 nodemailer 설정
const emailTransporter = nodemailer.createTransport({
  //   service: 'naver',
  host: 'smtp.naver.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = emailTransporter;
