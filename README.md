# TeleVault

A private, owner-only Telegram bot that turns Telegram into your personal
backup drive + gallery lock + project archive. Only your Telegram account
can talk to it — everyone else is silently ignored.

Files themselves stay on Telegram's servers (free, unlimited-ish storage).
MongoDB only stores the *metadata* — name, category, tags, favorites, notes —
so search and organization are instant.

## 1. Get your credentials

1. **Bot token** — open Telegram, message [@BotFather](https://t.me/BotFather),
   send `/newbot`, follow the prompts. It gives you a token like
   `123456789:AAExample...`.
2. **Your Telegram user ID** — message [@userinfobot](https://t.me/userinfobot),
   it replies instantly with your numeric ID.
3. **MongoDB** — either install MongoDB locally, or create a free cluster at
   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and copy the
   connection string.

## 2. Configure

```bash
cp .env.example .env
```

Edit `.env` and fill in `BOT_TOKEN`, `OWNER_ID`, and `MONGO_URI`.

## 3. Install & run

```bash
npm install
npm start        # production
npm run dev       # auto-restart on changes (nodemon)
```

You should see:

```
[..] INFO: MongoDB connected
[..] INFO: TeleVault bot is running.
```

Open Telegram, find your bot, send `/start`.

## 4. How to use it

- **Backup anything**: just send a file, photo, video, or audio message.
  The bot saves it and asks whether to file it under a Category, Project,
  or Gallery Album (or leave it uncategorized).
- **Browse**: `/files`, `/gallery`, `/projects`, `/favorites`, `/trash`
- **Search**: `/search invoice` — full-text search across filename, tags,
  and notes.
- **Per-file actions** (tap a file from any list): download, favorite,
  tag, rename, add a note, move to trash.
- **Trash**: soft-deleted files can be restored; anything left in trash
  longer than `TRASH_AUTO_DELETE_DAYS` (default 30) is purged automatically
  every night at 03:00.
- **Stats**: `/stats` shows total files, storage used, and a breakdown by
  type.

## 5. Project structure

```
televault/
├── server.js                  # entry point
├── src/
│   ├── config/                # env + MongoDB connection
│   ├── models/                # User, Category, Project, Album, File
│   ├── services/               # business logic (file, search, stats, taxonomy)
│   ├── jobs/                   # cron: trash auto-purge
│   ├── bot.js                  # wires everything into Telegraf
│   └── bot/
│       ├── middlewares/auth.js # owner-only gate
│       ├── keyboards/          # inline keyboard builders
│       ├── commands/           # /start /help /gallery /projects ...
│       └── handlers/           # upload, menu nav, browsing, file actions, text flows
```

## 6. Security model

Every single update (message or button tap) passes through
`src/bot/middlewares/auth.js`, which compares `ctx.from.id` against
`OWNER_ID` from your `.env`. Anyone else is silently dropped — no error
message, no acknowledgement. Keep your bot token and `.env` private; anyone
with the token could otherwise message your bot (though they still couldn't
use it without your Telegram ID).

## 7. Known limits (Telegram-imposed)

- Bots can only download files up to **20 MB**, but can *send* (and thus
  store) files up to **2 GB** via `sendDocument` — the bot never downloads
  the bytes itself, it just keeps Telegram's `file_id`, so this ceiling is
  Telegram's upload limit, not something this code restricts further.
- No built-in versioning of re-uploaded files with the same name — this is
  listed under "Future Features" below.

## 8. Ideas for later (not built yet)

These were in the original design discussion but intentionally left out of
v1 to keep it shippable. The architecture (separate service layer) makes
them straightforward to bolt on:

- File version history (`project-v1.zip` → `v2` → `v3`)
- Password-protected/hidden sub-folders
- Mirror backups to Google Drive/Dropbox
- Sharing a single file with another trusted Telegram account
- Storage usage charts (percentage by category)
- Web dashboard reusing the same MongoDB + service layer
