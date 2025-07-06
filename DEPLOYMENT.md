# Deployment Guide

This guide covers deployment options for the Telegram Watermark Bot on various serverless platforms.

## Prerequisites

Before deploying, ensure you have:

1. **Telegram Bot Token** from [@BotFather](https://t.me/botfather)
2. **Turso Database** created at [turso.tech](https://turso.tech)
3. **Node.js 18+** installed locally

## Vercel Deployment (Recommended)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Configure Environment Variables

```bash
# Set Telegram Bot Token
vercel env add TELEGRAM_BOT_TOKEN

# Set Turso Database URL
vercel env add TURSO_DATABASE_URL

# Set Turso Auth Token
vercel env add TURSO_AUTH_TOKEN
```

### 4. Set Webhook URL

After deployment, set your webhook URL:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.vercel.app/api/webhook"}'
```

### 5. Verify Deployment

Check your bot's status:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## AWS Lambda Deployment

### 1. Prepare for Lambda

Create a deployment package:

```bash
# Install dependencies
npm install --production

# Create ZIP file
zip -r lambda-deployment.zip . -x "node_modules/.cache/*" "*.git*" "*.md" "env.example"
```

### 2. Create Lambda Function

1. Go to AWS Lambda Console
2. Create function with Node.js 18.x runtime
3. Upload the ZIP file
4. Set memory to 512MB (minimum for Sharp)
5. Set timeout to 30 seconds

### 3. Configure Environment Variables

In Lambda console, set:

- `TELEGRAM_BOT_TOKEN`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

### 4. Create API Gateway

1. Create REST API
2. Create resource `/webhook`
3. Create POST method
4. Enable CORS
5. Deploy API

### 5. Set Webhook URL

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-api-gateway-url.amazonaws.com/webhook"}'
```

## Cloudflare Workers Deployment

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Create wrangler.toml

```toml
name = "telegram-watermark-bot"
main = "api/webhook.js"
compatibility_date = "2023-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

[[env.production.kv_namespaces]]
binding = "BOT_DATA"
id = "your-kv-namespace-id"
```

### 3. Deploy

```bash
wrangler login
wrangler deploy
```

### 4. Set Environment Variables

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TURSO_DATABASE_URL
wrangler secret put TURSO_AUTH_TOKEN
```

### 5. Set Webhook URL

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-worker.your-subdomain.workers.dev"}'
```

## Railway Deployment

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Deploy

```bash
railway login
railway init
railway up
```

### 3. Set Environment Variables

```bash
railway variables set TELEGRAM_BOT_TOKEN=your_token
railway variables set TURSO_DATABASE_URL=your_url
railway variables set TURSO_AUTH_TOKEN=your_token
```

### 4. Set Webhook URL

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.railway.app/webhook"}'
```

## Local Development with ngrok

### 1. Install ngrok

```bash
npm install -g ngrok
```

### 2. Start Local Server

```bash
npm start
```

### 3. Create Tunnel

```bash
ngrok http 3000
```

### 4. Set Webhook URL

Copy the ngrok URL and set it as your webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-ngrok-url.ngrok.io/webhook"}'
```

## Environment Variables Reference

| Variable             | Description                | Example                                   |
| -------------------- | -------------------------- | ----------------------------------------- |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token    | `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`    |
| `TURSO_DATABASE_URL` | Turso database URL         | `libsql://your-db.turso.io`               |
| `TURSO_AUTH_TOKEN`   | Turso authentication token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `WEBHOOK_URL`        | Webhook URL for production | `https://your-app.vercel.app/api/webhook` |

## Troubleshooting Deployment

### Common Issues

1. **Function Timeout**

   - Increase timeout to 30 seconds
   - Optimize image processing
   - Use smaller images for testing

2. **Memory Issues**

   - Increase memory allocation (512MB minimum)
   - Optimize Sharp usage
   - Handle large images properly

3. **Webhook Not Working**

   - Verify HTTPS URL
   - Check CORS settings
   - Ensure proper response format

4. **Database Connection**
   - Verify Turso credentials
   - Check network connectivity
   - Ensure database is accessible

### Testing Deployment

1. **Health Check**

   ```bash
   curl https://your-app.vercel.app/
   ```

2. **Webhook Test**

   ```bash
   curl -X POST https://your-app.vercel.app/api/webhook \
        -H "Content-Type: application/json" \
        -d '{"test": true}'
   ```

3. **Bot Status**
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
   ```

## Monitoring and Logs

### Vercel

```bash
vercel logs
```

### AWS Lambda

- Check CloudWatch logs
- Monitor function metrics

### Cloudflare Workers

```bash
wrangler tail
```

### Railway

```bash
railway logs
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **Webhook Security**: Use HTTPS only
3. **Rate Limiting**: Implement if needed
4. **Input Validation**: Validate all user inputs
5. **Error Handling**: Don't expose sensitive information in errors

## Performance Optimization

1. **Image Processing**: Optimize Sharp settings
2. **Database**: Use connection pooling
3. **Caching**: Implement if needed
4. **CDN**: Use for static assets
5. **Monitoring**: Track performance metrics
