const { mainMenu } = require('../keyboards');

module.exports = (bot) => {
  bot.start(async (ctx) => {
    ctx.session.pending = null;
    await ctx.reply(
      `👋 Welcome to *TeleVault* — your private backup vault.\n\nJust send me any file, photo, video, or audio and I'll take care of the rest.`,
      { parse_mode: 'Markdown', ...mainMenu }
    );
  });
};
