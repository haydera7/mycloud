const connectDB = require('./src/config/db');
const { launchBot } = require('./src/bot');
const { startAutoTrashJob } = require('./src/jobs/autoTrash');
const logger = require('./src/utils/logger');

(async () => {
  await connectDB();
  startAutoTrashJob();
  await launchBot();
})().catch((err) => {
  logger.error(`Fatal startup error: ${err.stack || err.message}`);
  process.exit(1);
});
