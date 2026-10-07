const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    telegramId: { type: Number, required: true, unique: true, index: true },
    username: String,
    firstName: String,
    lastName: String,
    isOwner: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
