const mongoose = require('mongoose');
const { Schema } = mongoose;

const refreshTokenSchema = new Schema({
  token: { type: String, required: true },
  userId: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
