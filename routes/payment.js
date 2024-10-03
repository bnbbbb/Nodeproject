const express = require('express');
const router = express.Router();
const payment = require('../controllers/payment');

// 결제 요청
router.post('/api/payment/request/:quotationId', payment.requestPayment);

// 결제 웹훅 (포트원 결제 성공/실패 통보)
router.post('/api/payment/success', payment.paymentWebhook);

router.get('/api/payment/list', payment.getPaymentList);

module.exports = router;
