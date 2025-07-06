# Telegram Watermark Bot - Quick Setup

## 🚀 Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure environment**:

   ```bash
   cp env.example .env
   # Edit .env with your credentials
   ```

3. **Test setup**:

   ```bash
   npm test
   ```

4. **Deploy to Vercel**:
   ```bash
   npm run deploy
   ```

## 📋 Required Credentials

### Telegram Bot Token

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Follow instructions to create bot
4. Copy the token to `.env`

### Turso Database

1. Go to [turso.tech](https://turso.tech)
2. Create account and database
3. Get database URL and auth token
4. Add to `.env`

## 🔧 Environment Variables

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_turso_token_here
WEBHOOK_URL=https://your-app.vercel.app/api/webhook
```

## 📁 Project Structure

```
telegram-watermark-bot/
├── api/
│   └── webhook.js          # Vercel serverless function
├── database.js             # Turso database operations
├── imageProcessor.js       # Sharp image processing
├── bot.js                  # Main bot logic
├── index.js                # Express server
├── test.js                 # Setup verification
├── package.json            # Dependencies
├── vercel.json            # Vercel configuration
├── env.example            # Environment template
├── README.md              # Full documentation
├── DEPLOYMENT.md          # Deployment guide
└── SETUP_SUMMARY.md       # This file
```

## 🎯 Key Features

- ✅ Watermark photos with customizable positions
- ✅ Store user preferences in Turso SQLite
- ✅ Serverless deployment ready
- ✅ Inline buttons for position customization
- ✅ Error handling and logging
- ✅ No external storage needed

## 🚨 Important Notes

1. **Image Format**: Use PNG with transparent background for best results
2. **File Size**: Optimized for images up to 10MB
3. **Memory**: Requires 512MB+ for Sharp processing
4. **Timeout**: Set to 30 seconds for image processing

## 🔗 Useful Commands

```bash
# Local development
npm run dev

# Test setup
npm test

# Deploy to Vercel
npm run deploy

# Check logs (after deployment)
vercel logs
```

## 📞 Support

- Check `README.md` for detailed documentation
- Review `DEPLOYMENT.md` for platform-specific guides
- Run `npm test` to verify setup
- Check Vercel logs for deployment issues
