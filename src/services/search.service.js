const File = require('../models/File');

/** Full text search across filename, tags, and notes. */
async function searchFiles(query, page = 0, pageSize = 8) {
  const filter = { trashed: false, $text: { $search: query } };
  const total = await File.countDocuments(filter);
  const items = await File.find(filter, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip(page * pageSize)
    .limit(pageSize);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

module.exports = { searchFiles };
