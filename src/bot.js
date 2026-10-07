const { Telegraf, session } = require('telegraf');
const { BOT_TOKEN } = require('./config/env');
const ownerOnly = require('./bot/middlewares/auth');
const logger = require('./utils/logger');
const taxonomy = require('./services/taxonomy.service');

const registerStart = require('./bot/commands/start');
const registerHelp = require('./bot/commands/help');
const { handleUpload } = require('./bot/handlers/upload');
const { registerMenuHandlers } = require('./bot/handlers/menu');
const { registerBrowseHandlers } = require('./bot/handlers/browse');
const { registerAssignHandlers } = require('./bot/handlers/assign');
const { registerFileActionHandlers } = require('./bot/handlers/fileActions');
const { registerTextHandler } = require('./bot/handlers/text');

const bot = new Telegraf(BOT_TOKEN);

// In-memory session is fine here: this bot has exactly one user.
bot.use(session({ defaultSession: () => ({ pending: null }) }));
bot.use(ownerOnly);

bot.catch((err, ctx) => {
  logger.error(`Unhandled error for update ${ctx.updateType}: ${err.stack || err.message}`);
  ctx.reply('⚠️ Something went wrong on my end. Please try again.').catch(() => {});
});

registerStart(bot);
registerHelp(bot);
registerMenuHandlers(bot);
registerBrowseHandlers(bot);
registerAssignHandlers(bot);
registerFileActionHandlers(bot);
registerTextHandler(bot); // must be registered so plain-text replies to prompts are caught

// Anything with an attached file triggers the backup flow.
bot.on(['document', 'photo', 'video', 'audio', 'voice'], handleUpload);

async function launchBot() {
  await taxonomy.ensureDefaults();
  await bot.launch();
  logger.info('TeleVault bot is running.');
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot, launchBot };
