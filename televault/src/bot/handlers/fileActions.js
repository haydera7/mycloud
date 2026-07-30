const File = require('../../models/File');
const fileService = require('../../services/file.service');
const { fileActions } = require('../keyboards');
const { formatBytes } = require('../../utils/helpers');

function describeFile(f) {
  return [
    `${f.favorite ? '⭐ ' : ''}*${f.fileName}*`,
    `Size: ${formatBytes(f.size)}`,
    f.tags?.length ? `Tags: ${f.tags.join(', ')}` : null,
    f.note ? `Note: ${f.note}` : null,
    `Added: ${f.createdAt.toISOString().slice(0, 10)}`,
  ]
    .filter(Boolean)
    .join('\n');
}

async function registerFileActionHandlers(bot) {
  bot.action(/^file:open:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery();
    const file = await File.findById(ctx.match[1]);
    if (!file) return ctx.editMessageText('File not found (maybe deleted).');
    await ctx.editMessageText(describeFile(file), { parse_mode: 'Markdown', ...fileActions(file) });
  });

  bot.action(/^file:download:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery('Sending...');
    const file = await File.findById(ctx.match[1]);
    if (!file) return ctx.reply('File not found.');
    const send = { document: ctx.telegram.sendDocument, photo: ctx.telegram.sendPhoto, video: ctx.telegram.sendVideo, audio: ctx.telegram.sendAudio, voice: ctx.telegram.sendVoice };
    const method = send[file.kind] || ctx.telegram.sendDocument;
    await method.call(ctx.telegram, ctx.chat.id, file.telegramFileId);
  });

  bot.action(/^file:fav:([a-f0-9]{24})$/, async (ctx) => {
    const file = await fileService.toggleFavorite(ctx.match[1]);
    await ctx.answerCbQuery(file.favorite ? 'Added to favorites' : 'Removed from favorites');
    await ctx.editMessageText(describeFile(file), { parse_mode: 'Markdown', ...fileActions(file) });
  });

  bot.action(/^file:trash:([a-f0-9]{24})$/, async (ctx) => {
    const file = await fileService.moveToTrash(ctx.match[1]);
    await ctx.answerCbQuery('Moved to trash');
    await ctx.editMessageText(describeFile(file), { parse_mode: 'Markdown', ...fileActions(file) });
  });

  bot.action(/^file:restore:([a-f0-9]{24})$/, async (ctx) => {
    const file = await fileService.restoreFromTrash(ctx.match[1]);
    await ctx.answerCbQuery('Restored');
    await ctx.editMessageText(describeFile(file), { parse_mode: 'Markdown', ...fileActions(file) });
  });

  bot.action(/^file:purge:([a-f0-9]{24})$/, async (ctx) => {
    await fileService.permanentlyDelete(ctx.match[1]);
    await ctx.answerCbQuery('Deleted permanently');
    await ctx.editMessageText('❌ File permanently deleted.');
  });

  bot.action(/^file:tag:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.pending = { type: 'awaiting_tag', fileId: ctx.match[1] };
    await ctx.editMessageText('🏷 Send tags separated by spaces or commas (e.g. `work important client`).', { parse_mode: 'Markdown' });
  });

  bot.action(/^file:note:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.pending = { type: 'awaiting_note', fileId: ctx.match[1] };
    await ctx.editMessageText('📝 Send the note text for this file.');
  });

  bot.action(/^file:rename:([a-f0-9]{24})$/, async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.pending = { type: 'awaiting_rename', fileId: ctx.match[1] };
    await ctx.editMessageText('✏️ Send the new file name (with extension).');
  });
}

module.exports = { registerFileActionHandlers, describeFile };
