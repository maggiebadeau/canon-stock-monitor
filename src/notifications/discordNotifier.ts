import axios from "axios";
import { config } from "../config";
import { logger } from "../utils/logger";

export type StockStatus = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  url: string;
  timestamp: string;
  footer: { text: string };
}

function buildEmbed(status: StockStatus, productUrl: string): DiscordEmbed {
  const isInStock = status === "IN_STOCK";
  return {
    title: isInStock ? "✅ Item Back In Stock!" : "❌ Item Out of Stock",
    description: isInStock
      ? "The Canon PowerShot G7 X Mark III is **available**. Buy now before it sells out!"
      : "The Canon PowerShot G7 X Mark III is **out of stock**.",
    color: isInStock ? 0x57f287 : 0xed4245,
    url: productUrl,
    timestamp: new Date().toISOString(),
    footer: { text: "Canon Stock Monitor" },
  };
}

export async function sendDiscordAlert(
  status: StockStatus,
  productUrl: string
): Promise<void> {
  const mention =
    config.discordMentionId ? `<@${config.discordMentionId}> ` : "";

  const payload = {
    content: mention || undefined,
    embeds: [buildEmbed(status, productUrl)],
  };

  try {
    await axios.post(config.discordWebhookUrl, payload);
    logger.info(`Discord alert sent: ${status}`);
  } catch (err) {
    logger.error(`Failed to send Discord alert: ${(err as Error).message}`);
  }
}
