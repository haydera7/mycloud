const { Schema, model } = require('mongoose');

const albumSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    coverFileId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = model('Album', albumSchema);
