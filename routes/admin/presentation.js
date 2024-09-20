const express = require('express');
// const {
//   isLoggedIn,
//   isNotLoggedIn,
//   verifyToken,
//   notUser,
// } = require('../middlewares/auth');
const uploadImage = require('../../utils/s3Utils');
const createPresentation = require('../../controllers/admin/presentation');
const router = express.Router();

router.post(
  '/api/presentation/create',
  uploadImage.single('image'),
  createPresentation
);

module.exports = router;
