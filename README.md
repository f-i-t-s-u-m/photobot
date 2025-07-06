# Telegram Watermark Bot

A serverless Telegram bot that adds customizable watermarks to photos. Built with Node.js, Turso SQLite, and Sharp for image processing.

## Features

- 🖼️ **Watermark Application**: Add watermarks to photos with customizable positions
- 🎨 **Position Customization**: Choose from 6 different watermark positions (top-left, top-right, center, bottom-left, bottom-right, bottom)
- 💾 **User Management**: Store user watermarks and preferences in Turso SQLite database
- 🔄 **Serverless**: Deploy on Vercel, AWS Lambda, or Cloudflare Workers
- 📱 **Telegram Integration**: Uses Telegram's file storage (no external storage needed)

## Tech Stack

- **Runtime**: Node.js 18+
- **Telegram API**: `node-telegram-bot-api`
- **Database**: Turso SQLite with `@libsql/client`
- **Image Processing**: Sharp
- **Deployment**: Vercel (serverless)

## Prerequisites

1. **Telegram Bot Token**: Create a bot via [@BotFather](https://t.me/botfather)
2. **Turso Database**: Create a database at [turso.tech](https://turso.tech)
3. **Node.js**: Version 18 or higher

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd telegram-watermark-bot
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Turso Database Configuration
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token_here

# Bot Configuration (for production)
WEBHOOK_URL=https://your-domain.vercel.app/api/webhook
```

### 3. Database Setup

The bot will automatically create the required table on first run. The schema is:

```sql
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    watermark_file_id TEXT,
    watermark_position TEXT DEFAULT 'bottom',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Local Development

For local development with polling:

```bash
npm run dev
```

For local development with webhook (requires ngrok):

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Update your .env with the ngrok URL
WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/webhook

# Start the bot
npm start
```

## Deployment

### Vercel Deployment

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Deploy**:

   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**:

   ```bash
   vercel env add TELEGRAM_BOT_TOKEN
   vercel env add TURSO_DATABASE_URL
   vercel env add TURSO_AUTH_TOKEN
   ```

4. **Set Webhook URL**:
   After deployment, set your webhook URL:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url": "https://your-app.vercel.app/api/webhook"}'
   ```

### AWS Lambda Deployment

1. Create a Lambda function with Node.js 18.x runtime
2. Upload the code as a ZIP file
3. Set environment variables
4. Configure API Gateway for webhook endpoint
5. Set the webhook URL in Telegram

### Cloudflare Workers

1. Install Wrangler CLI
2. Configure `wrangler.toml`
3. Deploy with `wrangler deploy`

## Usage

### Bot Commands

- `/start` - Initialize the bot and check watermark status

### User Flow

1. **First Time Setup**:

   - Send `/start`
   - Upload a watermark image (preferably PNG with transparent background)
   - Bot confirms watermark is set

2. **Adding Watermarks to Photos**:

   - Send any photo to the bot
   - Bot applies your watermark and returns the result
   - Use "Customize Position" button to adjust watermark placement

3. **Position Customization**:
   - Click "🎨 Customize Position" button
   - Choose from available positions
   - Bot updates the photo with new position

### Watermark Positions

- **Top Left**: Top-left corner
- **Top Right**: Top-right corner
- **Center**: Center of the image
- **Bottom Left**: Bottom-left corner
- **Bottom Right**: Bottom-right corner
- **Bottom**: Bottom center (default)

## API Endpoints

- `GET /` - Health check
- `POST /api/webhook` - Telegram webhook endpoint

## Error Handling

The bot includes comprehensive error handling for:

- Invalid image formats
- Database connection issues
- Telegram API rate limits
- Image processing errors
- Network timeouts

## Performance Considerations

- **Image Size**: Optimized for images up to 10MB
- **Processing Time**: Typically 2-5 seconds per image
- **Memory Usage**: Efficient buffer handling for serverless environments
- **Database**: Lightweight queries with proper indexing

## Troubleshooting

### Common Issues

1. **Bot not responding**:

   - Check webhook URL is correctly set
   - Verify environment variables
   - Check Vercel function logs

2. **Image processing fails**:

   - Ensure watermark image is valid
   - Check image format (PNG recommended)
   - Verify Sharp installation

3. **Database errors**:
   - Verify Turso credentials
   - Check database URL format
   - Ensure database is accessible

### Logs

Check Vercel function logs:

```bash
vercel logs
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

- Create an issue on GitHub
- Check the troubleshooting section
- Review Vercel function logs
