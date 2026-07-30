const { Markup } = require('telegraf');
const fileService = require('../../services/file.service');
const taxonomy = require('../../services/taxonomy.service');
const { categoryPicker, projectPicker, albumPicker } = require('../keyboards');

function doneKeyboard() {
  return Markup.inlineKeyboard([[Markup.button.callback('✅ Done', 'assign:done')]]);
}

async function registerAssignHandlers(bot) {
  bot.action(/^assign:category:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery();
    const fileId = ctx.match[1];
    ctx.session.pending = { type: 'assigning', fileId, target: 'category' };
    const categories = await taxonomy.listCategories();
    await ctx.editMessageText('📁 Pick a category:', categoryPicker(categories, 'setcat'));
  });

  bot.action(/^assign:project:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery();
    const fileId = ctx.match[1];
    ctx.session.pending = { type: 'assigning', fileId, target: 'project' };
    const projects = await taxonomy.listProjects();
    await ctx.editMessageText('💻 Pick a project:', projectPicker(projects, 'setproj'));
  });

  bot.action(/^assign:album:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery();
    const fileId = ctx.match[1];
    ctx.session.pending = { type: 'assigning', fileId, target: 'album' };
    const albums = await taxonomy.listAlbums();
    await ctx.editMessageText('🖼 Pick an album:', albumPicker(albums, 'setalbum'));
  });

  bot.action('assign:done', async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.pending = null;
    await ctx.editMessageText('✅ Filed away. Send another file anytime, or /start for the menu.');
  });

  // Existing category chosen
  bot.action(/^setcat:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery();
    const fileId = ctx.session.pending?.fileId;
    if (!fileId) return ctx.editMessageText('Session expired, please resend the file.');
    await fileService.setCategory(fileId, ctx.match[1]);
    ctx.session.pending = { type: 'assigning', fileId };
    await ctx.editMessageText('✅ Category set. File it anywhere else?', assignMoreKeyboard(fileId));
  });

  bot.action('setcat:new', async (ctx) => {
    await ctx.answerCbQuery();
    if (ctx.session.pending) ctx.session.pending.type = 'awaiting_new_category';
    await ctx.editMessageText('📁 Send me the name for the new category.');
  });

  bot.action(/^setproj:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery();
    const fileId = ctx.session.pending?.fileId;
    if (!fileId) return ctx.editMessageText('Session expired, please resend the file.');
    await fileService.setProject(fileId, ctx.match[1]);
    ctx.session.pending = { type: 'assigning', fileId };
    await ctx.editMessageText('✅ Added to project. File it anywhere else?', assignMoreKeyboard(fileId));
  });

  bot.action('setproj:new', async (ctx) => {
    await ctx.answerCbQuery();
    if (ctx.session.pending) ctx.session.pending.type = 'awaiting_new_project';
    await ctx.editMessageText('💻 Send me the name for the new project.');
  });

  bot.action(/^setalbum:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery();
    const fileId = ctx.session.pending?.fileId;
    if (!fileId) return ctx.editMessageText('Session expired, please resend the file.');
    await fileService.setAlbum(fileId, ctx.match[1]);
    ctx.session.pending = { type: 'assigning', fileId };
    await ctx.editMessageText('✅ Added to album. File it anywhere else?', assignMoreKeyboard(fileId));
  });

  bot.action('setalbum:new', async (ctx) => {
    await ctx.answerCbQuery();
    if (ctx.session.pending) ctx.session.pending.type = 'awaiting_new_album';
    await ctx.editMessageText('🖼 Send me the name for the new album.');
  });
}

function assignMoreKeyboard(fileId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📁 Category', `assign:category:${fileId}`)],
    [Markup.button.callback('💻 Project', `assign:project:${fileId}`)],
    [Markup.button.callback('🖼 Gallery Album', `assign:album:${fileId}`)],
    [Markup.button.callback('✅ Done', 'assign:done')],
  ]);
}

module.exports = { registerAssignHandlers, assignMoreKeyboard };
