const { Markup } = require('telegraf');
const fileService = require('../../services/file.service');
const taxonomy = require('../../services/taxonomy.service');
const searchService = require('../../services/search.service');
const { fileList } = require('../keyboards');
const { assignMoreKeyboard } = require('./assign');

function parseTags(text) {
  return text
    .split(/[\s,]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

async function registerTextHandler(bot) {
  bot.on('text', async (ctx, next) => {
    const pending = ctx.session.pending;
    if (!pending) return next(); // not a reply to anything we asked - ignore / fall through

    const text = ctx.message.text.trim();

    switch (pending.type) {
      case 'awaiting_new_category': {
        const category = await taxonomy.createCategory(text);
        if (pending.fileId) {
          await fileService.setCategory(pending.fileId, category._id);
          ctx.session.pending = { type: 'assigning', fileId: pending.fileId };
          return ctx.reply(`✅ Created category "${text}" and filed it there. File it anywhere else?`, assignMoreKeyboard(pending.fileId));
        }
        ctx.session.pending = null;
        return ctx.reply(`✅ Category "${text}" created.`);
      }

      case 'awaiting_new_project': {
        const project = await taxonomy.createProject(text);
        if (pending.fileId) {
          await fileService.setProject(pending.fileId, project._id);
          ctx.session.pending = { type: 'assigning', fileId: pending.fileId };
          return ctx.reply(`✅ Created project "${text}" and added the file. File it anywhere else?`, assignMoreKeyboard(pending.fileId));
        }
        ctx.session.pending = null;
        return ctx.reply(`✅ Project "${text}" created.`);
      }

      case 'awaiting_new_album': {
        const album = await taxonomy.createAlbum(text);
        if (pending.fileId) {
          await fileService.setAlbum(pending.fileId, album._id);
          ctx.session.pending = { type: 'assigning', fileId: pending.fileId };
          return ctx.reply(`✅ Created album "${text}" and added the file. File it anywhere else?`, assignMoreKeyboard(pending.fileId));
        }
        ctx.session.pending = null;
        return ctx.reply(`✅ Album "${text}" created.`);
      }

      case 'awaiting_tag': {
        const tags = parseTags(text);
        await fileService.addTags(pending.fileId, tags);
        ctx.session.pending = null;
        return ctx.reply(`🏷 Tags added: ${tags.join(', ')}`);
      }

      case 'awaiting_note': {
        await fileService.setNote(pending.fileId, text);
        ctx.session.pending = null;
        return ctx.reply('📝 Note saved.');
      }

      case 'awaiting_rename': {
        await fileService.rename(pending.fileId, text);
        ctx.session.pending = null;
        return ctx.reply(`✏️ Renamed to "${text}".`);
      }

      case 'awaiting_search': {
        ctx.session.pending = null;
        const { items, totalPages } = await searchService.searchFiles(text, 0);
        if (!items.length) {
          return ctx.reply(`No results for "${text}".`, Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back', 'menu:main')]]));
        }
        return ctx.reply(`🔍 Results for "${text}":`, fileList(items, 0, totalPages, `searchpage:${encodeURIComponent(text)}`));
      }

      default:
        return next();
    }
  });

  // /search <term> as a direct command too
  bot.command('search', async (ctx) => {
    const term = ctx.message.text.split(' ').slice(1).join(' ').trim();
    if (!term) return ctx.reply('Usage: /search <term>');
    const { items, totalPages } = await searchService.searchFiles(term, 0);
    if (!items.length) return ctx.reply(`No results for "${term}".`);
    return ctx.reply(`🔍 Results for "${term}":`, fileList(items, 0, totalPages, `searchpage:${encodeURIComponent(term)}`));
  });

  bot.action(/^searchpage:(.+):(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const term = decodeURIComponent(ctx.match[1]);
    const page = Number(ctx.match[2]);
    const { items, totalPages } = await searchService.searchFiles(term, page);
    await ctx.editMessageText(`🔍 Results for "${term}":`, fileList(items, page, totalPages, `searchpage:${encodeURIComponent(term)}`));
  });
}

module.exports = { registerTextHandler };
