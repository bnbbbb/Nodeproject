const mongoose = require('mongoose');
const hitsPostSchema = require('../models/mongo/hitsPost');
const { ObjectId } = require('mongoose').Types;
const hitsPost = async (postId, userIp, modelType, transaction) => {
  console.log(postId, userIp, modelType);
  try {
    const checkUser = await checkUserIP(postId, userIp, modelType);
    if (!checkUser) {
      return false;
    }
    const hit = await hitsPostSchema.create(
      {
        postId: postId,
        userIp: userIp,
        modelType: modelType,
      },
      { transaction }
    );
    return hit;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const checkUserIP = async (postId, userIp, modelType) => {
  const checkUser = await hitsPostSchema.findOne({
    postId: postId,
    userIp: userIp,
    modelType: modelType,
  });
  return !checkUser;
};

module.exports = hitsPost;
