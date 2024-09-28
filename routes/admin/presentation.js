const express = require('express');

const uploadImage = require('../../utils/s3Utils');
const {
  createPresentation,
  listPresentation,
  editPresentation,
  deletePresentation,
} = require('../../controllers/admin/presentation');
const { verifyToken } = require('../../middlewares/auth');
const isAdmin = require('../../middlewares/admin');
const router = express.Router();

router.post(
  '/api/presentation/create',
  uploadImage.single('image'),
  isAdmin,
  verifyToken,
  createPresentation
);

router.get('/api/presentation/list', listPresentation);

router.patch(
  '/api/presentation/edit/:presentationId',
  uploadImage.single('image'),
  isAdmin,
  verifyToken,
  editPresentation
);

router.delete(
  '/api/presentation/delete/:presentationId',
  verifyToken,
  isAdmin,
  deletePresentation
);

module.exports = router;
