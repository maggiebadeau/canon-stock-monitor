# canon-stock-monitor

Monitors Canon product stock and sends Discord alerts when availability changes.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   npx playwright install chromium
   ```

2. **Configure `.env`**
   ```
   CANON_PRODUCT_URL=https://www.usa.canon.com/shop/p/powershot-g7-x-mark-iii?color=Black&type=New
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN
   POLL_INTERVAL_MS=60000
   DISCORD_MENTION_ID=           # optional: Discord user/role ID to @mention
   ```

3. **Run**
   ```bash
   npm run dev          # development (ts-node)
   npm run build && npm start  # production
   ```

## How it works

- Launches a headless Chromium browser via Playwright to render the Canon product page
- Detects stock status from the page (Add to Cart button or out-of-stock phrases)
- Sends a Discord embed alert on **initial check** and whenever **status changes**
- Logs all activity to console and `monitor.log`

## Project structure

```
src/
  index.ts                    # Entry point, polling loop
  config.ts                   # Loads and validates env vars
  monitor/
    canonMonitor.ts           # Playwright scraper
  notifications/
    discordNotifier.ts        # Discord webhook sender
  utils/
    logger.ts                 # Winston logger
```
