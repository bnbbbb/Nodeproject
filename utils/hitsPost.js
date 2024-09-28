const mongoose = require('mongoose');
const hitsPostSchema = require('../models/mongo/hitsPost');
const { ObjectId } = require('mongoose').Types;
const hitsPost = async (postId, userIp, modelType) => {
  try {
    const checkUser = await checkUserIP(postId, userIp, modelType);
    if (!checkUser) {
      return false;
    }
    const hit = await hitsPostSchema.create({
      postId: postId,
      userIp: userIp,
      modelType: modelType,
    });
    return hit;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createHitPost = async (postId, userIp, modelType) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const hit = await hitsPost(postId, userIp, modelType, session);
    await session.commitTransaction();
    return hit;
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    throw error;
  } finally {
    session.endSession();
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

module.exports = { hitsPost, createHitPost };
