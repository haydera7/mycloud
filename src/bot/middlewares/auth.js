const { OWNER_ID } = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Blocks every update that doesn't come from the owner's Telegram account.
 * This is the entire "security model" of the bot: nobody else exists to it.
 */
module.exports = async function ownerOnly(ctx, next) {
  const fromId = ctx.from && ctx.from.id;

  if (fromId !== OWNER_ID) {
    if (fromId) {
      logger.warn(`Blocked unauthorized access attempt from Telegram ID ${fromId}`);
    }
    // Stay silent on purpose - don't reveal this bot does anything to strangers.
    return;
  }

  return next();
};
