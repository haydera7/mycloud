const { Markup } = require('telegraf');
const { truncate } = require('../../utils/helpers');

const mainMenu = Markup.inlineKeyboard([
  [Markup.button.callback('📁 Files', 'menu:files'), Markup.button.callback('🖼 Gallery', 'menu:gallery')],
  [Markup.button.callback('💻 Projects', 'menu:projects'), Markup.button.callback('⭐ Favorites', 'menu:favorites')],
  [Markup.button.callback('🔍 Search', 'menu:search'), Markup.button.callback('📊 Statistics', 'menu:stats')],
  [Markup.button.callback('🗑 Trash', 'menu:trash'), Markup.button.callback('❓ Help', 'menu:help')],
]);

function categoryPicker(categories, prefix = 'setcat') {
  const rows = categories.map((c) => [Markup.button.callback(`${c.icon} ${c.name}`, `${prefix}:${c._id}`)]);
  rows.push([Markup.button.callback('➕ New category', `${prefix}:new`)]);
  rows.push([Markup.button.callback('⬅️ Back', 'menu:main')]);
  return Markup.inlineKeyboard(rows);
}

function projectPicker(projects, prefix = 'setproj') {
  const rows = projects.map((p) => [Markup.button.callback(`💻 ${p.name}`, `${prefix}:${p._id}`)]);
  rows.push([Markup.button.callback('➕ New project', `${prefix}:new`)]);
  rows.push([Markup.button.callback('⬅️ Back', 'menu:main')]);
  return Markup.inlineKeyboard(rows);
}

function albumPicker(albums, prefix = 'setalbum') {
  const rows = albums.map((a) => [Markup.button.callback(`🖼 ${a.name}`, `${prefix}:${a._id}`)]);
  rows.push([Markup.button.callback('➕ New album', `${prefix}:new`)]);
  rows.push([Markup.button.callback('⬅️ Back', 'menu:main')]);
  return Markup.inlineKeyboard(rows);
}

function fileList(files, page, totalPages, listPrefix) {
  const rows = files.map((f) => [
    Markup.button.callback(`${f.favorite ? '⭐ ' : ''}${truncate(f.fileName, 32)}`, `file:open:${f._id}`),
  ]);
  const nav = [];
  if (page > 0) nav.push(Markup.button.callback('⬅️ Prev', `${listPrefix}:${page - 1}`));
  if (page < totalPages - 1) nav.push(Markup.button.callback('Next ➡️', `${listPrefix}:${page + 1}`));
  if (nav.length) rows.push(nav);
  rows.push([Markup.button.callback('⬅️ Back to menu', 'menu:main')]);
  return Markup.inlineKeyboard(rows);
}

function fileActions(file) {
  if (file.trashed) {
    return Markup.inlineKeyboard([
      [Markup.button.callback('♻️ Restore', `file:restore:${file._id}`)],
      [Markup.button.callback('❌ Delete Forever', `file:purge:${file._id}`)],
      [Markup.button.callback('⬅️ Back', 'menu:main')],
    ]);
  }
  return Markup.inlineKeyboard([
    [Markup.button.callback('⬇️ Download', `file:download:${file._id}`)],
    [
      Markup.button.callback(file.favorite ? '💔 Unfavorite' : '⭐ Favorite', `file:fav:${file._id}`),
      Markup.button.callback('🏷 Tag', `file:tag:${file._id}`),
    ],
    [Markup.button.callback('✏️ Rename', `file:rename:${file._id}`), Markup.button.callback('📝 Note', `file:note:${file._id}`)],
    [Markup.button.callback('🗑 Move to Trash', `file:trash:${file._id}`)],
    [Markup.button.callback('⬅️ Back', 'menu:main')],
  ]);
}

const confirmCancel = (yesData, noData = 'menu:main') =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Confirm', yesData), Markup.button.callback('❌ Cancel', noData)],
  ]);

module.exports = { mainMenu, categoryPicker, projectPicker, albumPicker, fileList, fileActions, confirmCancel };
