const handleError = require('./utils');

// 게시글 존재 여부 확인
const verifyPostExists = (post, type) => {
  if (!post) {
    return handleError(404, `해당 ${type}을/를 찾지 못하였습니다.`);
  }
};

// 게시글 작성자 확인
const verifyPostAuthor = (post, userId) => {
  if (post.writer !== userId) {
    return handleError(
      404,
      '본인이 작성한 게시글만 수정 및 삭제 할 수 있습니다.'
    );
  }
};

// 게시글 검증 함수
exports.verifyPost = async (post, userId, type) => {
  verifyPostExists(post, type);
  verifyPostAuthor(post, userId);
  return {};
};
