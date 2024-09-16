exports.verifyPost = async (post, userId, type) => {
  console.log(post.writer, userId);
  console.log(type);

  if (!post) {
    const error = new Error(`해당 ${type}을/를 찾지 못하였습니다.`);
    error.status = 404;
    throw error;
  }

  if (post.writer !== userId) {
    const error = new Error(
      '본인이 작성한 게시글만 수정 및 삭제 할 수 있습니다.'
    );
    error.status = 403;
    throw error;
  }

  return {};
};
