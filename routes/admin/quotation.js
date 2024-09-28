const {
  createQuotation,
  getQuotation,
  editQuotation,
} = require('../../controllers/admin/quotation');
const express = require('express');
const { verifyToken } = require('../../middlewares/auth');
const isAdmin = require('../../middlewares/admin');

const router = express.Router();

router.post(
  '/api/quotation/create/:foundationId',
  isAdmin,
  verifyToken,
  createQuotation
);

router.patch(
  '/api/quotation/edit/:quotationId',
  isAdmin,
  verifyToken,
  editQuotation
);

router.get('/api/quotation/:quotationId', verifyToken, getQuotation);

module.exports = router;
