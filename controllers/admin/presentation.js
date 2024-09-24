const { sequelize } = require('../../models/mysql');
const Presentation = require('../../models/mysql/presentation');
const verifyPresentation = require('../../utils/presentationUtils');
const handleError = require('../../utils/utils');

const createPresentation = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const fileUrl = req.file.location;

    const presentation = await Presentation.create({
      title,
      content,
      img: fileUrl,
      writer: userId,
    });
    // await transaction.commit();

    res.status(201).json({ message: '업로드 및 생성 성공', presentation });
  } catch (error) {
    // await transaction.rollback();
    console.error(error);
    next(error);
  }
};

const listPresentation = async (req, res, next) => {
  //
  try {
    const presentations = await Presentation.findAll();
    return res.status(200).json({ code: 200, presentations });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const editPresentation = async (req, res, next) => {
  // const transaction = await sequelize.transaction();
  try {
    const { presentationId } = req.params;
    const updateData = req.body;

    const userId = req.user.id;
    const verificationResult = await verifyPresentation(presentationId, userId);

    if (!verificationResult) return;

    if (req.file) {
      updateData.img = req.file.location;
    }

    const [updatedCount] = await Presentation.update(updateData, {
      where: { id: presentationId },
      paranoid: false,
      // transaction,
    });

    if (updatedCount === 0) {
      return handleError(404, '설명회 수정 중 오류가 발생했습니다.', next);
    }

    // await transaction.commit();
    return res.status(200).json({ code: 200, updateData });
  } catch (error) {
    // await transaction.rollback();
    // console.error(error);
    next(error);
  }
};

const deletePresentation = async (req, res, next) => {
  // const transaction = await sequelize.transaction();
  try {
    //
    const { presentationId } = req.params;
    const userId = req.user.id;

    const presentation = await verifyPresentation(presentationId, userId);
    console.log(presentation);

    if (!presentation) return;

    await presentation.destroy();
    // await transaction.commit();

    return res.status(200).json({ message: '설명회 삭제에 성공하였습니다.' });
  } catch (error) {
    // await transaction.rollback();
    next(error);
  }
};

module.exports = {
  createPresentation,
  listPresentation,
  editPresentation,
  deletePresentation,
};
