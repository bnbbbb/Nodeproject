const mongoose = require('mongoose');

const refreshTokenSchema = new Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: ture },
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
