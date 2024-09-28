const { sequelize } = require('../models/mysql');
const Foundation = require('../models/mysql/foundation');
const User = require('../models/mysql/user');
const emailTransporter = require('../utils/email');
const moment = require('moment-timezone');
const handleError = require('../utils/utils');

// 창업 컨설팅 요청
exports.createFoundation = async (req, res, next) => {
  try {
    //
    const { firstProcess, secondProcess } = req.body;
    const secondProcessJson = JSON.stringify(secondProcess);
    const userId = req.user.id;

    // const foundation = await Foundation.create({
    //   writer: userId,
    //   firstProcess,
    //   secondProcess,
    // });

    const query = `
      insert into foundations (writer, firstProcess, secondProcess, createdAt, updatedAt)
      values (?, ?, ?, NOW(), NOW())
    `;

    const userQuery = `
      select username, email, contact,
      companyName, business, region, startDate,
      isStore, storeCount, sales from users
      where id = ?
    `;

    const foundations = await sequelize.query(query, {
      replacements: [userId, firstProcess, secondProcessJson],
      type: sequelize.QueryTypes.INSERT,
    });
    const user = await sequelize.query(userQuery, {
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT,
    });
    const htmlContent = `
    <html>
    <body>
      <h1>창업 컨설팅 요청이 완료되었습니다.</h1>
        <h3>고객 정보</h3>
        <ul>
        ${Object.entries(user[0]) // user는 배열이므로 첫 번째 요소를 선택
          .map(
            ([key, value]) => `
            <li><strong>${key}:</strong> ${value}</li>
        `
          )
          .join('')}
      </ul>
        
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
        handleError(500, err);
        // return res.status(500).json({ code: 500 });
      }
      console.log('이메일 전송 성공: ', info.response);
      return res.status(200).json({ code: 200, foundations });
    });
  } catch (error) {
    //
    console.error(error);
    next(error);
  }
};

exports.listFoundation = async (req, res, next) => {
  try {
    // const foundations = await Foundation.findAll();
    const query = `
    select f.id, f.firstProcess, u.username, f.createdAt
    from foundations as f
    join users as u on f.writer = u.id`;

    const foundations = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json({ code: 200, foundations });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getFoundation = async (req, res, next) => {
  try {
    const { foundationId } = req.params;

    // ORM
    const foundation = await Foundation.findOne({
      where: { id: foundationId },
      include: [
        {
          model: User,
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt'],
          },
        },
      ],
    });

    // Query
    const foundationQuery = `
      select f.* , u.username, u.email, u.contact,
      u.companyName, u.business, u.region, u.startDate,
      u.isStore, u.storeCount,u.sales
      from foundations as f
      join users as u on f.writer = u.id
      where f.id = :foundationId
    `;
    const foundations = await sequelize.query(foundationQuery, {
      replacements: { foundationId: foundationId },
      type: sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json({ code: 200, foundations });
  } catch (error) {
    next(error);
  }
};
