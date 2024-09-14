const Foundation = require('../models/mysql/foundation');
const User = require('../models/mysql/user');
const emailTransporter = require('../utils/email');
const moment = require('moment-timezone');

// 창업 컨설팅 요청
exports.createFoundation = async (req, res, next) => {
  try {
    //
    const { firstProcess, secondProcess } = req.body;

    const foundation = await Foundation.create({
      writer: req.user.id,
      firstProcess,
      secondProcess,
    });
    const htmlContent = `
    <html>
    <body>
        <h1>창업 컨설팅 요청이 완료되었습니다.</h1>
        <p><strong>첫 번째 프로세스:</strong></p>
        <h3><b>${firstProcess}</h3>
        <p><strong>두번째 프로세스:</strong></p>
        <ul>
        ${Object.entries(secondProcess)
          .map(
            ([key, value]) => `
            <li><strong>${key}:</strong> ${value}</li>
        `
          )
          .join('')}
        </ul>
    </body>
    </html>
    `;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: '창업 컨설팅 요청 확인',
      html: htmlContent,
    };
    emailTransporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('이메일 전송 오류: ', err);
        //   return next(err);
        return res.status(200).json({ code: 500 });
      }
      console.log('이메일 전송 성공: ', info.response);
      return res.status(200).json({ code: 200, foundation });
    });
  } catch (error) {
    //
    console.error(error);
    next(error);
  }
};

exports.listFoundation = async (req, res, next) => {
  try {
    const foundations = await Foundation.findAll();
    return res.status(200).json({ code: 200, foundations });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
