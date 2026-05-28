import { config } from "./config";
import { checkStockStatus, StockStatus } from "./monitor/canonMonitor";
import { sendDiscordAlert } from "./notifications/discordNotifier";
import { logger } from "./utils/logger";

let lastKnownStatus: StockStatus | null = null;

async function poll(): Promise<void> {
  const currentStatus = await checkStockStatus(config.canonProductUrl);

  if (currentStatus === "UNKNOWN") {
    logger.warn("Could not determine stock status — skipping alert.");
    return;
  }

  if (lastKnownStatus === null) {
    logger.info(`Initial stock status: ${currentStatus}`);
    lastKnownStatus = currentStatus;
    await sendDiscordAlert(currentStatus, config.canonProductUrl);
    return;
  }

  if (currentStatus !== lastKnownStatus) {
    logger.info(`Stock status changed: ${lastKnownStatus} → ${currentStatus}`);
    lastKnownStatus = currentStatus;
    await sendDiscordAlert(currentStatus, config.canonProductUrl);
  } else {
    logger.info(`Stock status unchanged: ${currentStatus}`);
  }
}

async function main(): Promise<void> {
  logger.info("Canon Stock Monitor started.");
  logger.info(`Product URL: ${config.canonProductUrl}`);
  logger.info(`Poll interval: ${config.pollIntervalMs}ms`);

  await poll();

  setInterval(poll, config.pollIntervalMs);
}

main().catch((err: Error) => {
  logger.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
