const express = require('express');
const { verifyToken, notUser } = require('../../middlewares/auth');
// const isAdmin = require('../middlewares/admin');
const isAdmin = require('../../middlewares/admin');
const { listFoundation } = require('../../controllers/foundation');

const router = express.Router();

// router.get('/list', isAdmin, listFoundation);
router.get('/list', listFoundation);

module.exports = router;
