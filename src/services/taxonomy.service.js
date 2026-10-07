const Category = require('../models/Category');
const Project = require('../models/Project');
const Album = require('../models/Album');

const DEFAULT_CATEGORIES = [
  { name: 'Projects', icon: '💻' },
  { name: 'Images', icon: '🖼' },
  { name: 'Videos', icon: '🎥' },
  { name: 'Documents', icon: '📄' },
  { name: 'Music', icon: '🎵' },
  { name: 'Archives', icon: '📦' },
];

async function ensureDefaults() {
  const count = await Category.countDocuments();
  if (count === 0) await Category.insertMany(DEFAULT_CATEGORIES);
}

const listCategories = () => Category.find().sort({ name: 1 });
const createCategory = (name, icon = '📁') => Category.create({ name, icon });

const listProjects = (status = 'active') => Project.find({ status }).sort({ name: 1 });
const createProject = (name, description = '') => Project.create({ name, description });
const archiveProject = (id) => Project.findByIdAndUpdate(id, { status: 'archived' }, { new: true });

const listAlbums = () => Album.find().sort({ name: 1 });
const createAlbum = (name) => Album.create({ name });

module.exports = {
  ensureDefaults,
  listCategories,
  createCategory,
  listProjects,
  createProject,
  archiveProject,
  listAlbums,
  createAlbum,
};
