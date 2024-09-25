const {
  createQuotation,
  getQuotation,
  editQuotation,
} = require('../../controllers/admin/quotation');
const express = require('express');
const { verifyToken } = require('../../middlewares/auth');

const router = express.Router();

router.post('/api/quotation/create/:foundationId', createQuotation);

router.patch('/api/quotation/edit/:quotationId', editQuotation);

router.get('/api/quotation/:quotationId', getQuotation);

module.exports = router;
