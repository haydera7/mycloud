const { Markup } = require('telegraf');
const fileService = require('../../services/file.service');
const { formatBytes } = require('../../utils/helpers');

/** Normalizes the different Telegram message types into one shape. */
function extractIncoming(ctx) {
  const msg = ctx.message;

  if (msg.document) {
    const d = msg.document;
    return {
      telegramFileId: d.file_id,
      telegramUniqueFileId: d.file_unique_id,
      fileName: d.file_name || `document_${Date.now()}`,
      mimeType: d.mime_type,
      size: d.file_size,
      kind: 'document',
    };
  }
  if (msg.photo) {
    const p = msg.photo[msg.photo.length - 1]; // highest resolution
    return {
      telegramFileId: p.file_id,
      telegramUniqueFileId: p.file_unique_id,
      fileName: `photo_${Date.now()}.jpg`,
      mimeType: 'image/jpeg',
      size: p.file_size,
      kind: 'photo',
    };
  }
  if (msg.video) {
    const v = msg.video;
    return {
      telegramFileId: v.file_id,
      telegramUniqueFileId: v.file_unique_id,
      fileName: v.file_name || `video_${Date.now()}.mp4`,
      mimeType: v.mime_type,
      size: v.file_size,
      kind: 'video',
    };
  }
  if (msg.audio) {
    const a = msg.audio;
    return {
      telegramFileId: a.file_id,
      telegramUniqueFileId: a.file_unique_id,
      fileName: a.file_name || `audio_${Date.now()}.mp3`,
      mimeType: a.mime_type,
      size: a.file_size,
      kind: 'audio',
    };
  }
  if (msg.voice) {
    const v = msg.voice;
    return {
      telegramFileId: v.file_id,
      telegramUniqueFileId: v.file_unique_id,
      fileName: `voice_${Date.now()}.ogg`,
      mimeType: v.mime_type,
      size: v.file_size,
      kind: 'voice',
    };
  }
  return null;
}

async function handleUpload(ctx) {
  const incoming = extractIncoming(ctx);
  if (!incoming) return;

  incoming.messageId = ctx.message.message_id;

  const { file, duplicate } = await fileService.saveIncomingFile(incoming);

  if (duplicate) {
    return ctx.reply(`⚠️ This file already exists in your vault as "${file.fileName}". Skipped duplicate.`);
  }

  ctx.session.pending = { type: 'assigning', fileId: file._id.toString() };

  return ctx.reply(
    `✅ Saved: ${file.fileName}\nSize: ${formatBytes(file.size)}\n\nWhere should I file it?`,
    Markup.inlineKeyboard([
      [Markup.button.callback('📁 Category', `assign:category:${file._id}`)],
      [Markup.button.callback('💻 Project', `assign:project:${file._id}`)],
      [Markup.button.callback('🖼 Gallery Album', `assign:album:${file._id}`)],
      [Markup.button.callback('✅ Leave uncategorized', 'assign:done')],
    ])
  );
}

module.exports = { handleUpload };
