const { Markup } = require('telegraf');
const fileService = require('../../services/file.service');
const { fileList } = require('../keyboards');

async function registerBrowseHandlers(bot) {
  // browsecat:<categoryId> or browsecat:new (new here just means "create category", offered from menu:files too)
  bot.action(/^browsecat:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery();
    const categoryId = ctx.match[1];
    ctx.session.lastBrowse = { kind: 'category', id: categoryId };
    const { items, totalPages } = await fileService.listByCategory(categoryId, 0);
    if (!items.length) {
      return ctx.editMessageText('No files here yet.', Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'menu:files')]]));
    }
    await ctx.editMessageText('📁 Files:', fileList(items, 0, totalPages, `browsecatpage:${categoryId}`));
  });

  bot.action(/^browsecatpage:([a-f0-9]{24}):(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const [, categoryId, pageStr] = ctx.match;
    const page = Number(pageStr);
    const { items, totalPages } = await fileService.listByCategory(categoryId, page);
    await ctx.editMessageText('📁 Files:', fileList(items, page, totalPages, `browsecatpage:${categoryId}`));
  });

  bot.action(/^browseproj:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery();
    const projectId = ctx.match[1];
    const { items, totalPages } = await fileService.listByProject(projectId, 0);
    if (!items.length) {
      return ctx.editMessageText('No files in this project yet.', Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'menu:projects')]]));
    }
    await ctx.editMessageText('💻 Project files:', fileList(items, 0, totalPages, `browseprojpage:${projectId}`));
  });

  bot.action(/^browseprojpage:([a-f0-9]{24}):(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const [, projectId, pageStr] = ctx.match;
    const page = Number(pageStr);
    const { items, totalPages } = await fileService.listByProject(projectId, page);
    await ctx.editMessageText('💻 Project files:', fileList(items, page, totalPages, `browseprojpage:${projectId}`));
  });

  bot.action(/^browsealbum:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery();
    const albumId = ctx.match[1];
    const { items, totalPages } = await fileService.listByAlbum(albumId, 0);
    if (!items.length) {
      return ctx.editMessageText('No photos/videos in this album yet.', Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'menu:gallery')]]));
    }
    await ctx.editMessageText('🖼 Album:', fileList(items, 0, totalPages, `browsealbumpage:${albumId}`));
  });

  bot.action(/^browsealbumpage:([a-f0-9]{24}):(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const [, albumId, pageStr] = ctx.match;
    const page = Number(pageStr);
    const { items, totalPages } = await fileService.listByAlbum(albumId, page);
    await ctx.editMessageText('🖼 Album:', fileList(items, page, totalPages, `browsealbumpage:${albumId}`));
  });
}

module.exports = { registerBrowseHandlers };
