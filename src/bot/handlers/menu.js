const { Markup } = require('telegraf');
const { mainMenu, categoryPicker, projectPicker, albumPicker, fileList } = require('../keyboards');
const taxonomy = require('../../services/taxonomy.service');
const fileService = require('../../services/file.service');
const statsService = require('../../services/stats.service');

async function registerMenuHandlers(bot) {
  bot.action('menu:main', async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.pending = null;
    await ctx.editMessageText('🏠 Main Menu — what do you need?', mainMenu).catch(() => ctx.reply('🏠 Main Menu', mainMenu));
  });

  bot.action('menu:help', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      [
        '❓ *TeleVault Help*',
        '',
        'Just send me any file, photo, video, or audio and I will back it up and ask how to file it.',
        '',
        '/start – main menu',
        '/gallery – your private albums',
        '/projects – your project archives',
        '/search <term> – find anything by name, tag or note',
        '/favorites – starred files',
        '/stats – storage overview',
        '/trash – recently deleted files',
      ].join('\n'),
      { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'menu:main')]]) }
    );
  });

  bot.action('menu:files', async (ctx) => {
    await ctx.answerCbQuery();
    const categories = await taxonomy.listCategories();
    await ctx.editMessageText('📁 Choose a category to browse:', categoryPicker(categories, 'browsecat'));
  });

  bot.action('menu:gallery', async (ctx) => {
    await ctx.answerCbQuery();
    const albums = await taxonomy.listAlbums();
    if (!albums.length) {
      return ctx.editMessageText(
        '🖼 You have no albums yet. Send me a photo or video to create your first one.',
        Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'menu:main')]])
      );
    }
    await ctx.editMessageText('🖼 Your private albums:', albumPicker(albums, 'browsealbum'));
  });

  bot.action('menu:projects', async (ctx) => {
    await ctx.answerCbQuery();
    const projects = await taxonomy.listProjects();
    if (!projects.length) {
      return ctx.editMessageText(
        '💻 No projects yet. Send me a project file to create your first one.',
        Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'menu:main')]])
      );
    }
    await ctx.editMessageText('💻 Your projects:', projectPicker(projects, 'browseproj'));
  });

  bot.action('menu:favorites', async (ctx) => {
    await ctx.answerCbQuery();
    const { items, totalPages } = await fileService.listFavorites(0);
    if (!items.length) {
      return ctx.editMessageText('⭐ No favorites yet.', Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'menu:main')]]));
    }
    await ctx.editMessageText('⭐ Favorites:', fileList(items, 0, totalPages, 'page:favorites'));
  });

  bot.action('menu:trash', async (ctx) => {
    await ctx.answerCbQuery();
    const { items, totalPages } = await fileService.listTrash(0);
    if (!items.length) {
      return ctx.editMessageText('🗑 Trash is empty.', Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'menu:main')]]));
    }
    await ctx.editMessageText('🗑 Trash (auto-deleted after 30 days):', fileList(items, 0, totalPages, 'page:trash'));
  });

  bot.action('menu:search', async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.pending = { type: 'awaiting_search' };
    await ctx.editMessageText('🔍 Send me a search term (filename, tag, or note).');
  });

  bot.action('menu:stats', async (ctx) => {
    await ctx.answerCbQuery();
    const s = await statsService.getOverview();
    await ctx.editMessageText(
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
      { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'menu:main')]]) }
    );
  });

  // Paginated list navigation, e.g. page:favorites:1 or page:trash:2
  bot.action(/^page:(favorites|trash):(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const [, kind, pageStr] = ctx.match;
    const page = Number(pageStr);
    const { items, totalPages } =
      kind === 'favorites' ? await fileService.listFavorites(page) : await fileService.listTrash(page);
    await ctx.editMessageText(
      kind === 'favorites' ? '⭐ Favorites:' : '🗑 Trash:',
      fileList(items, page, totalPages, `page:${kind}`)
    );
  });
}

module.exports = { registerMenuHandlers };
