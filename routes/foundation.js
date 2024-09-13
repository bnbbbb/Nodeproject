const express = require('express');
const { verifyToken, notUser } = require('../middlewares/auth');
const { createFoundation } = require('../controllers/foundation');
const router = express.Router();

router.post('/api/foundation/create', verifyToken, createFoundation);

module.exports = router;
