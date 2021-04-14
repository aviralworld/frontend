import dotenvSafe from "dotenv-safe";

import { createLogger } from "./logger";
import { createServer } from "./server/create";
import type { IFrontendSettings } from "./server/frontendSettings";
import type { ISettings } from "./server/settings";
import { parseDecimalInt } from "./normalize";

const logger = createLogger();

logger.debug("Reading environment values...");
dotenvSafe.config();

logger.debug("Initializing configuration...");
const { PORT, NODE_ENV, REVISION, TIMESTAMP } = process.env;
const dev = NODE_ENV === "development";

logger.debug("Initializing settings...");
const SETTINGS: ISettings = {
  adminPort: parseDecimalInt(process.env.FRONTEND_ADMIN_PORT),
  apiUrl: new URL(process.env.FRONTEND_API_URL),
  compression: process.env.FRONTEND_COMPRESSION === "1",
  dev,
  enableAdminMode: process.env.FRONTEND_ENABLE_ADMIN_MODE === "1",
  healthCheckTimeoutMs: parseDecimalInt(
    process.env.FRONTEND_HEALTH_CHECK_TIMEOUT_MS,
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
    debounceDelayMs: parseDecimalInt(getValue("DEBOUNCE_DELAY_MS")),
    maxRecordingLengthSeconds: parseDecimalInt(
      getValue("MAX_RECORDING_LENGTH_SECONDS"),
    ),
    minRecordingLengthSeconds: parseDecimalInt(
      getValue("MIN_RECORDING_LENGTH_SECONDS"),
    ),
    randomStoryCount: parseDecimalInt(getValue("RANDOM_STORY_COUNT")),
  };
}

logger.debug("Creating server...");

createServer(
  logger,
  parseDecimalInt(PORT),
  SETTINGS,
  dev,
  parseFrontendSettings("FRONTEND_", process.env),
  REVISION,
  TIMESTAMP,
);
