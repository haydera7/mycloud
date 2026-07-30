const { Schema, model } = require('mongoose');

const fileSchema = new Schema(
  {
    telegramFileId: { type: String, required: true },
    telegramUniqueFileId: { type: String, required: true, index: true },
    messageId: Number,

    fileName: { type: String, required: true },
    mimeType: String,
    extension: String,
    size: Number, // bytes
    kind: {
      type: String,
      enum: ['document', 'photo', 'video', 'audio', 'voice'],
      required: true,
    },

    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    project: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    album: { type: Schema.Types.ObjectId, ref: 'Album', default: null },

    tags: { type: [String], default: [], index: true },
    favorite: { type: Boolean, default: false },
    note: { type: String, default: '' },

    trashed: { type: Boolean, default: false },
    trashedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

fileSchema.index({ fileName: 'text', tags: 'text', note: 'text' });

module.exports = model('File', fileSchema);
