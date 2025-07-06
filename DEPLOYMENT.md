# Deployment Guide - Next.js 15 Telegram Bot

This guide will help you deploy your Telegram Watermark Bot to Vercel using Next.js 15.

## Prerequisites

1. **Telegram Bot Token**: Get from [@BotFather](https://t.me/botfather)
2. **LibSQL Database**: Create at [turso.tech](https://turso.tech)
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Step 1: Prepare Your Environment

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Create environment file**:

   ```bash
   cp env.example .env.local
   ```

3. **Configure environment variables** in `.env.local`:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   WEBHOOK_URL=https://your-app-name.vercel.app
   DATABASE_URL=libsql://your-database-name.turso.io
   DATABASE_AUTH_TOKEN=your_turso_auth_token_here
   ```

## Step 2: Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:

   ```bash
   npm run deploy
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Confirm deployment settings
   - Wait for deployment to complete

## Step 3: Configure Environment Variables on Vercel

1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add the following variables**:
   - `TELEGRAM_BOT_TOKEN`
   - `WEBHOOK_URL` (your Vercel app URL)
   - `DATABASE_URL`
   - `DATABASE_AUTH_TOKEN`

## Step 4: Initialize the Bot

1. **Visit your deployed app**: `https://your-app-name.vercel.app`
2. **Initialize the bot**: Visit `https://your-app-name.vercel.app/api/init`
3. **Verify webhook is set**: Check the response

## Step 5: Test Your Bot

1. **Open Telegram** and find your bot
2. **Send `/start`** to begin
3. **Upload a watermark image**
4. **Send photos** to test watermarking

## Troubleshooting

### Bot Not Responding

1. **Check webhook URL**:

   ```bash
   curl -X GET "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
   ```

2. **Re-set webhook if needed**:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url": "https://your-app-name.vercel.app/api/webhook"}'
   ```

### Environment Variables Issues

1. **Check Vercel logs**:

   ```bash
   vercel logs
   ```

2. **Redeploy after changing env vars**:
   ```bash
   vercel --prod
   ```

### Database Connection Issues

1. **Verify LibSQL credentials**
2. **Check database URL format**
3. **Ensure database is accessible**

## Monitoring

- **Vercel Dashboard**: Monitor function performance
- **Function Logs**: Check for errors and debugging
- **Telegram Bot API**: Monitor webhook delivery

## Performance Tips

- **Image Size**: Keep images under 10MB for optimal performance
- **Database**: Use LibSQL's connection pooling
- **Caching**: Consider implementing response caching for repeated requests

## Security Considerations

- **Environment Variables**: Never commit `.env.local` to version control
- **Bot Token**: Keep your Telegram bot token secure
- **Database Access**: Use read-only tokens where possible
- **Rate Limiting**: Implement rate limiting for production use

## Support

For issues:

1. Check Vercel function logs
2. Verify environment variables
3. Test webhook connectivity
4. Review this troubleshooting guide
