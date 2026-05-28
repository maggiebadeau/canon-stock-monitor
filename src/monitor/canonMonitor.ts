import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { StockStatus } from "../notifications/discordNotifier";
import { logger } from "../utils/logger";

chromium.use(StealthPlugin());

export type { StockStatus };

const OUT_OF_STOCK_SELECTORS = [
  "div.stock.unavailable",
  ".notify-discontinued-wrapper",
];

const OUT_OF_STOCK_TEXTS = [
  "out of stock",
  "notify me when available",
  "sorry, this item is no longer available",
  "sold out",
];

const IN_STOCK_SELECTORS = [
  "div.stock.available",
];

export async function checkStockStatus(url: string): Promise<StockStatus> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    logger.info(`Checking stock at: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    await page.waitForTimeout(8000);

    for (const selector of OUT_OF_STOCK_SELECTORS) {
      const el = await page.$(selector);
      if (el) {
        logger.info(`Stock status: OUT_OF_STOCK (selector matched: ${selector})`);
        return "OUT_OF_STOCK";
      }
    }

    for (const selector of IN_STOCK_SELECTORS) {
      const el = await page.$(selector);
      if (el) {
        logger.info(`Stock status: IN_STOCK (selector matched: ${selector})`);
        return "IN_STOCK";
      }
    }

    const pageText = (await page.textContent("body") ?? "").toLowerCase();

    if (pageText.includes("access denied")) {
      logger.warn("Stock status: UNKNOWN (page returned Access Denied — bot detection triggered)");
      return "UNKNOWN";
    }

    for (const phrase of OUT_OF_STOCK_TEXTS) {
      if (pageText.includes(phrase)) {
        logger.info(`Stock status: OUT_OF_STOCK (found phrase: "${phrase}")`);
        return "OUT_OF_STOCK";
      }
    }

    if (pageText.includes("add to cart")) {
      logger.info("Stock status: IN_STOCK (found 'add to cart' text)");
      return "IN_STOCK";
    }

    logger.warn("Stock status: UNKNOWN (could not determine from page content)");
    return "UNKNOWN";
  } catch (err) {
    logger.error(`Error checking stock: ${(err as Error).message}`);
    return "UNKNOWN";
  } finally {
    await browser.close();
  }
}
