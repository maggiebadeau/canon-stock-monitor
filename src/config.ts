import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  canonProductUrl: requireEnv("CANON_PRODUCT_URL"),
  discordWebhookUrl: requireEnv("DISCORD_WEBHOOK_URL"),
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS ?? "60000", 10),
  discordMentionId: process.env.DISCORD_MENTION_ID ?? "",
};
