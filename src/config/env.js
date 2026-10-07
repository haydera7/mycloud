require('dotenv').config();

const required = ['BOT_TOKEN', 'OWNER_ID', 'MONGO_URI'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  OWNER_ID: Number(process.env.OWNER_ID),
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  TRASH_AUTO_DELETE_DAYS: Number(process.env.TRASH_AUTO_DELETE_DAYS || 30),
};
