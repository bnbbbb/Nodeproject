const express = require('express');

const { uploadImage } = require('../../utils/s3Utils');
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
  verifyToken,
  isAdmin,
  createPresentation
);

router.get('/api/presentation/list', listPresentation);

router.patch(
  '/api/presentation/edit/:presentationId',
  uploadImage.single('image'),
  verifyToken,
  isAdmin,
  editPresentation
);

router.delete(
  '/api/presentation/delete/:presentationId',
  verifyToken,
  isAdmin,
  deletePresentation
);

module.exports = router;
