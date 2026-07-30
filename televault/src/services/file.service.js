const File = require('../models/File');
const { extOf } = require('../utils/helpers');

/** Persists metadata for a file whose bytes already live on Telegram's servers. */
async function saveIncomingFile({ telegramFileId, telegramUniqueFileId, messageId, fileName, mimeType, size, kind }) {
  // Duplicate detection: same Telegram unique file id = same underlying file.
  const existing = await File.findOne({ telegramUniqueFileId, trashed: false });
  if (existing) return { file: existing, duplicate: true };

  const file = await File.create({
    telegramFileId,
    telegramUniqueFileId,
    messageId,
    fileName,
    mimeType,
    extension: extOf(fileName),
    size,
    kind,
  });
  return { file, duplicate: false };
}

async function setCategory(fileId, categoryId) {
  return File.findByIdAndUpdate(fileId, { category: categoryId }, { new: true });
}

async function setProject(fileId, projectId) {
  return File.findByIdAndUpdate(fileId, { project: projectId }, { new: true });
}

async function setAlbum(fileId, albumId) {
  return File.findByIdAndUpdate(fileId, { album: albumId }, { new: true });
}

async function toggleFavorite(fileId) {
  const file = await File.findById(fileId);
  if (!file) return null;
  file.favorite = !file.favorite;
  await file.save();
  return file;
}

async function addTags(fileId, tags) {
  return File.findByIdAndUpdate(fileId, { $addToSet: { tags: { $each: tags } } }, { new: true });
}

async function setNote(fileId, note) {
  return File.findByIdAndUpdate(fileId, { note }, { new: true });
}

async function rename(fileId, fileName) {
  return File.findByIdAndUpdate(fileId, { fileName }, { new: true });
}

async function moveToTrash(fileId) {
  return File.findByIdAndUpdate(fileId, { trashed: true, trashedAt: new Date() }, { new: true });
}

async function restoreFromTrash(fileId) {
  return File.findByIdAndUpdate(fileId, { trashed: false, trashedAt: null }, { new: true });
}

async function permanentlyDelete(fileId) {
  return File.findByIdAndDelete(fileId);
}

async function listByCategory(categoryId, page = 0, pageSize = 8) {
  return listPaged({ category: categoryId, trashed: false }, page, pageSize);
}

async function listByProject(projectId, page = 0, pageSize = 8) {
  return listPaged({ project: projectId, trashed: false }, page, pageSize);
}

async function listByAlbum(albumId, page = 0, pageSize = 8) {
  return listPaged({ album: albumId, trashed: false }, page, pageSize);
}

async function listFavorites(page = 0, pageSize = 8) {
  return listPaged({ favorite: true, trashed: false }, page, pageSize);
}

async function listTrash(page = 0, pageSize = 8) {
  return listPaged({ trashed: true }, page, pageSize);
}

async function listPaged(filter, page = 0, pageSize = 8) {
  const total = await File.countDocuments(filter);
  const items = await File.find(filter)
    .sort({ createdAt: -1 })
    .skip(page * pageSize)
    .limit(pageSize);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

async function findAutoTrashCandidates(olderThanDate) {
  return File.find({ trashed: true, trashedAt: { $lte: olderThanDate } });
}

module.exports = {
  saveIncomingFile,
  setCategory,
  setProject,
  setAlbum,
  toggleFavorite,
  addTags,
  setNote,
  rename,
  moveToTrash,
  restoreFromTrash,
  permanentlyDelete,
  listByCategory,
  listByProject,
  listByAlbum,
  listFavorites,
  listTrash,
  listPaged,
  findAutoTrashCandidates,
};
