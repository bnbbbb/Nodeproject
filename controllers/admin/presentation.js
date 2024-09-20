const Presentation = require('../../models/mysql/presentation');

const createPresentation = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const fileUrl = req.file.location;

    const presentation = await Presentation.create({
      title,
      content,
      img: fileUrl,
    });

    res.status(201).json({ message: '업로드 및 생성 성공', presentation });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = createPresentation;
