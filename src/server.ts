import dotenvSafe from "dotenv-safe";

import { createLogger } from "./logger";
import { createServer } from "./server/create";
import type { IFrontendSettings } from "./server/frontendSettings";
import type { ISettings } from "./server/settings";

const logger = createLogger();

logger.debug("Reading environment values...");
dotenvSafe.config();

logger.debug("Initializing configuration...");
const { PORT, NODE_ENV, REVISION, TIMESTAMP } = process.env;
const dev = NODE_ENV === "development";

logger.debug("Initializing settings...");
const SETTINGS: ISettings = {
  adminPort: parseInt(process.env.FRONTEND_ADMIN_PORT, 10),
  apiUrl: new URL(process.env.FRONTEND_API_URL),
  compression: process.env.FRONTEND_COMPRESSION === "1",
  dev,
  enableAdminMode: process.env.FRONTEND_ENABLE_ADMIN_MODE === "1",
  healthCheckTimeoutMs: parseInt(
    process.env.FRONTEND_HEALTH_CHECK_TIMEOUT_MS,
    10,
  ),
  serveStatic: process.env.FRONTEND_SERVE_STATIC !== "0",
};

function parseFrontendSettings(
  prefix: string,
  env: { [k: string]: string },
): IFrontendSettings {
  const getValue = (k: string) => env[`${prefix}${k}`];

  return {
    baseUrl: getValue("BASE_URL"),
    dev,
    debounceDelayMs: parseInt(getValue("DEBOUNCE_DELAY_MS"), 10),
    maxRecordingLengthSeconds: parseInt(
      getValue("MAX_RECORDING_LENGTH_SECONDS"),
      10,
    ),
    minRecordingLengthSeconds: parseInt(
      getValue("MIN_RECORDING_LENGTH_SECONDS"),
      10,
    ),
    randomStoryCount: parseInt(getValue("RANDOM_STORY_COUNT"), 10),
  };
}

logger.debug("Creating server...");

createServer(
  logger,
  parseInt(PORT, 10),
  SETTINGS,
  dev,
  parseFrontendSettings("FRONTEND_", process.env),
  REVISION,
  TIMESTAMP,
);
