const taxonomy = require('../../services/taxonomy.service');
const fileService = require('../../services/file.service');
const statsService = require('../../services/stats.service');
const { albumPicker, projectPicker, fileList, categoryPicker } = require('../keyboards');

module.exports = (bot) => {
  bot.help(async (ctx) => {
    await ctx.reply(
      [
        '❓ *TeleVault Help*',
        '',
        'Send me any file, photo, video, or audio and I will back it up and ask how to file it.',
        '',
        '/start – main menu',
        '/gallery – your private albums',
        '/projects – your project archives',
        '/files – browse by category',
        '/search <term> – find anything by name, tag or note',
        '/favorites – starred files',
        '/stats – storage overview',
        '/trash – recently deleted files',
      ].join('\n'),
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('gallery', async (ctx) => {
    const albums = await taxonomy.listAlbums();
    if (!albums.length) return ctx.reply('🖼 No albums yet. Send me a photo or video to create your first one.');
    await ctx.reply('🖼 Your private albums:', albumPicker(albums, 'browsealbum'));
  });

  bot.command('projects', async (ctx) => {
    const projects = await taxonomy.listProjects();
    if (!projects.length) return ctx.reply('💻 No projects yet. Send me a project file to create your first one.');
    await ctx.reply('💻 Your projects:', projectPicker(projects, 'browseproj'));
  });

  bot.command('files', async (ctx) => {
    const categories = await taxonomy.listCategories();
    await ctx.reply('📁 Choose a category to browse:', categoryPicker(categories, 'browsecat'));
  });

  bot.command('favorites', async (ctx) => {
    const { items, totalPages } = await fileService.listFavorites(0);
    if (!items.length) return ctx.reply('⭐ No favorites yet.');
    await ctx.reply('⭐ Favorites:', fileList(items, 0, totalPages, 'page:favorites'));
  });

  bot.command('trash', async (ctx) => {
    const { items, totalPages } = await fileService.listTrash(0);
    if (!items.length) return ctx.reply('🗑 Trash is empty.');
    await ctx.reply('🗑 Trash:', fileList(items, 0, totalPages, 'page:trash'));
  });

  bot.command('stats', async (ctx) => {
    const s = await statsService.getOverview();
    await ctx.reply(
      [
        '📊 *Storage Statistics*',
        '',
        `Total files: ${s.totalFiles}`,
        `Used storage: ${s.totalSizeFormatted}`,
        '',
        `🖼 Images: ${s.images}`,
        `🎥 Videos: ${s.videos}`,
        `📄 Documents: ${s.documents}`,
        `🎵 Audio: ${s.audio}`,
        '',
        `⭐ Favorites: ${s.favorites}`,
        `🗑 In trash: ${s.trashed}`,
        `📁 Categories: ${s.categories}`,
        `💻 Projects: ${s.projects}`,
      ].join('\n'),
      { parse_mode: 'Markdown' }
    );
  });
};
