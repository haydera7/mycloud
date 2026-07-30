const { Schema, model } = require('mongoose');

const projectSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = model('Project', projectSchema);
