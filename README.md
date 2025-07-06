# Telegram Watermark Bot

A Telegram bot that adds watermarks to photos, built with Next.js 15 and deployed on Vercel.

## Features

- Add custom watermarks to photos
- Multiple watermark positions (top-left, top-right, center, bottom-left, bottom-right, bottom)
- User-specific watermark storage
- Real-time position customization
- Serverless deployment on Vercel

## Tech Stack

- **Next.js 15** - React framework with API routes
- **node-telegram-bot-api** - Telegram Bot API wrapper
- **Sharp** - High-performance image processing
- **LibSQL** - SQLite database for user data
- **Vercel** - Serverless deployment platform

## Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd photobot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file with:

   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   WEBHOOK_URL=https://your-domain.vercel.app
   DATABASE_URL=your_libsql_database_url
   DATABASE_AUTH_TOKEN=your_libsql_auth_token
   ```

4. **Development**

   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**
   ```bash
   npm run deploy
   ```

## API Routes

- `GET /` - Health check and status page
- `GET /api/init` - Initialize bot and set webhook
- `POST /api/webhook` - Telegram webhook endpoint

## Bot Commands

- `/start` - Start the bot and set up watermark
- Send an image - Add watermark to the image
- Use inline buttons to customize watermark position

## Deployment

The bot is designed to work with Vercel's serverless functions. After deployment:

1. Visit your domain to verify the bot is running
2. Call `/api/init` to set up the webhook with Telegram
3. Start chatting with your bot!

## File Structure

```
photobot/
├── app/
│   ├── api/
│   │   ├── webhook/
│   │   │   └── route.js      # Telegram webhook handler
│   │   └── init/
│   │       └── route.js      # Bot initialization
│   ├── layout.js             # Root layout
│   └── page.js               # Home page
├── bot.js                    # Bot logic and handlers
├── database.js               # Database operations
├── imageProcessor.js         # Image processing with Sharp
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies and scripts
└── vercel.json               # Vercel deployment config
```

## Environment Variables

- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token from @BotFather
- `WEBHOOK_URL` - Your Vercel deployment URL
- `DATABASE_URL` - LibSQL database URL
- `DATABASE_AUTH_TOKEN` - LibSQL authentication token

## License

MIT
