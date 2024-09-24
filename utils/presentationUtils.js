const Presentation = require('../models/mysql/presentation');
const handleError = require('./utils');

const verifyPresentation = async (presentationId, userId) => {
  const presentation = await Presentation.findByPk(presentationId);
  if (!presentation) {
    return handleError(404, '해당 설명회를 찾을 수 없습니다.');
  }
  return verifyPresentationUser(presentation, userId);
};

const verifyPresentationUser = (presentation, userId) => {
  if (presentation.writer !== userId) {
    return handleError(
      400,
      '본인이 작성한 설명회만 수정 및 삭제할 수 있습니다.'
    );
  }
  return presentation;
};

module.exports = verifyPresentation;
