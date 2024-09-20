const crypto = require('crypto');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

// S3 클라이언트 설정
const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
});

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];

// 이미지 업로드 설정
const uploadImage = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, callback) => {
      const uploadDirectory = req.query.directory ?? 'presentation';
      const extension = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        return callback(new Error('허용되지 않는 파일 확장자입니다.'));
      }
      const encryptedName = crypto.randomBytes(16).toString('hex');
      callback(
        null,
        `${uploadDirectory}/${Date.now()}_${encryptedName}${extension}`
      );
    },
    acl: 'public-read',
  }),
});

module.exports = uploadImage;
