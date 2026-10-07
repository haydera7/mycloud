const cron = require('node-cron');
const File = require('../models/File');
const { TRASH_AUTO_DELETE_DAYS } = require('../config/env');
const logger = require('../utils/logger');

function startAutoTrashJob() {
  // Runs once a day at 03:00 server time.
  cron.schedule('0 3 * * *', async () => {
    const cutoff = new Date(Date.now() - TRASH_AUTO_DELETE_DAYS * 24 * 60 * 60 * 1000);
    const result = await File.deleteMany({ trashed: true, trashedAt: { $lte: cutoff } });
    if (result.deletedCount) {
      logger.info(`Auto-purged ${result.deletedCount} file(s) from trash (older than ${TRASH_AUTO_DELETE_DAYS} days).`);
    }
  });
}

module.exports = { startAutoTrashJob };
