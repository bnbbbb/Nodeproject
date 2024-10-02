const express = require('express');
const { verifyToken, isAuthorOrAdmin } = require('../middlewares/auth');
const {
  createFoundation,
  getFoundation,
} = require('../controllers/foundation');
const router = express.Router();

router.post('/api/foundation/create', verifyToken, createFoundation);

router.get(
  '/api/foundation/detail/:foundationId',
  verifyToken,
  isAuthorOrAdmin,
  getFoundation
);

module.exports = router;
