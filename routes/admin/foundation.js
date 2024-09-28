const express = require('express');
const { verifyToken, notUser } = require('../../middlewares/auth');
const isAdmin = require('../../middlewares/admin');
const { listFoundation } = require('../../controllers/foundation');

const router = express.Router();

// router.get('/list', isAdmin, listFoundation);
router.get('/api/admin/foundation/list', isAdmin, verifyToken, listFoundation);

module.exports = router;
