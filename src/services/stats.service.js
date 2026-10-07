const File = require('../models/File');
const Category = require('../models/Category');
const Project = require('../models/Project');
const { formatBytes } = require('../utils/helpers');

async function getOverview() {
  const [totalFiles, totalSize, byKind, favorites, trashed, categories, projects] = await Promise.all([
    File.countDocuments({ trashed: false }),
    File.aggregate([{ $match: { trashed: false } }, { $group: { _id: null, sum: { $sum: '$size' } } }]),
    File.aggregate([{ $match: { trashed: false } }, { $group: { _id: '$kind', count: { $sum: 1 } } }]),
    File.countDocuments({ favorite: true, trashed: false }),
    File.countDocuments({ trashed: true }),
    Category.countDocuments(),
    Project.countDocuments(),
  ]);

  const kindCounts = Object.fromEntries(byKind.map((k) => [k._id, k.count]));

  return {
    totalFiles,
    totalSizeFormatted: formatBytes(totalSize[0]?.sum || 0),
    images: kindCounts.photo || 0,
    videos: kindCounts.video || 0,
    documents: kindCounts.document || 0,
    audio: (kindCounts.audio || 0) + (kindCounts.voice || 0),
    favorites,
    trashed,
    categories,
    projects,
  };
}

module.exports = { getOverview };
