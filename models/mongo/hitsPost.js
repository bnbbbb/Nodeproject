const mongoose = require('mongoose');
const { Schema } = mongoose;

const hitsPostSchema = new Schema({
  postId: { type: Number, required: true },
  userIp: { type: String, required: true },
  modelType: {
    type: String,
    required: true,
    enum: ['Review', 'QnA', 'Consult', 'Estimate'],
  },
  createdAt: { type: Date, default: Date.now },
});

hitsPostSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('View', hitsPostSchema);
