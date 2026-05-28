import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { config } from "../config";

chromium.use(StealthPlugin());

async function debugPage(): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  console.log(`Navigating to: ${config.canonProductUrl}`);
  await page.goto(config.canonProductUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(8000);

  const pageText = (await page.textContent("body") ?? "").toLowerCase();

  console.log("\n--- PAGE TEXT (first 3000 chars, lowercased) ---");
  console.log(pageText.slice(0, 3000));

  console.log("\n--- BUTTON TEXT on page ---");
  const buttons = await page.$$eval("button", (btns) =>
    btns.map((b) => ({ text: b.textContent?.trim(), disabled: b.disabled, id: b.id, classes: b.className }))
  );
  console.log(JSON.stringify(buttons, null, 2));

  console.log("\n--- Elements containing 'stock', 'cart', 'available', 'notify' ---");
  const keywords = ["stock", "cart", "available", "notify", "sold"];
  for (const kw of keywords) {
    const matches = await page.$$eval(
      `*`,
      (els, word) =>
        els
          .filter((el) => el.children.length === 0 && el.textContent?.toLowerCase().includes(word))
          .map((el) => ({ tag: el.tagName, text: el.textContent?.trim().slice(0, 100) }))
          .slice(0, 5),
      kw
    );
    if (matches.length) {
      console.log(`\n"${kw}" matches:`);
      console.log(JSON.stringify(matches, null, 2));
    }
  }

  await browser.close();
}

debugPage().catch(console.error);
