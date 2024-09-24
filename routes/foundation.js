const express = require('express');
const { verifyToken, notUser } = require('../middlewares/auth');
const {
  createFoundation,
  getFoundation,
} = require('../controllers/foundation');
const router = express.Router();

router.post('/api/foundation/create', verifyToken, createFoundation);

// router.get('/api/foundation/detail/:foundationId', verifyToken, getFoundation);
router.get('/api/foundation/detail/:foundationId', getFoundation);

module.exports = router;
