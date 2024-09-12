const Presentation = require('../../models/mysql/presentation');

const createPresentation = async (req, res, next) => {
  try {
    //
    const { title, content } = req.body;
    const presentation = await Presentation.create({
      // TODO S3 버킷 이미지 업로드
    });
  } catch (error) {
    //
  }
};
