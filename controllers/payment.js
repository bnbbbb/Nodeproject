const axios = require('axios');
const Quotation = require('../models/mysql/quotation');
const dotenv = require('dotenv');
const Payment = require('../models/mysql/Payment');
const { sequelize } = require('../models/mysql');
dotenv.config();

exports.requestPayment = async (req, res, next) => {
  const { quotationId } = req.params; // 견적서 ID
  const { totalAmount, userInfo } = req.body; // 결제 금액과 사용자 정보

  try {
    // 포트원 결제 준비 요청
    const getToken = await axios({
      url: 'https://api.iamport.kr/users/getToken',
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      data: {
        imp_key: process.env.PORTONE_API_KEY, // REST API 키
        imp_secret: process.env.PORTONE_SECRET_KEY,
      },
    });

    const { access_token } = getToken.data.response;
    const order_id = 'order_' + Date.now();
    // 결제 요청
    const createPayment = await axios({
      url: 'https://api.iamport.kr/payments/prepare',
      method: 'post',
      headers: { Authorization: access_token },
      data: {
        merchant_uid: order_id,
        amount: totalAmount,
        buyer_name: userInfo.name,
        buyer_email: userInfo.email,
      },
    });

    res.json({
      message: '결제 요청이 성공적으로 처리되었습니다.',
      merchant_uid: order_id,
      data: createPayment.data,
    });
  } catch (error) {
    next(error);
  }
};

exports.paymentWebhook = async (req, res, next) => {
  const {
    imp_uid,
    merchant_uid,
    status,
    quotationId,
    amount,
    cardName,
    cardNum,
  } = req.body;
  console.log(imp_uid, merchant_uid, status, quotationId);

  try {
    if (status === 'paid') {
      // 결제 성공 처리 로직 (예: 견적서 결제 상태 업데이트)
      await Payment.create({
        amount: amount,
        paymentId: imp_uid, // 결제 ID를 저장
        paymentStatus: status, // 결제 상태 저장
        quotationId: quotationId, // 전달받은 quotationId 저장
        merchant_uid: merchant_uid,
        cardName: cardName,
        cardNum: cardNum,
      });
      res.status(200).send('success');
    } else {
      res.status(400).send('fail');
    }
  } catch (error) {
    next(error);
  }
};

exports.getPaymentList = async (req, res, next) => {
  try {
    const query = `
    select * from payments
    where paymentStatus = ?
    `;
    const payments = await sequelize.query(query, {
      replacements: ['paid'],
      type: sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json({ code: 200, payments });
  } catch (error) {
    next(error);
  }
};
