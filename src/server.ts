import dotenvSafe from "dotenv-safe";

import { createLogger } from "./logger";
import { createServer } from "./server/create";
import type { IFrontendSettings } from "./server/frontendSettings";

dotenvSafe.config();

const { PORT, NODE_ENV, REVISION, TIMESTAMP } = process.env;
const dev = NODE_ENV === "development";

const SETTINGS = {
  apiUrl: new URL(process.env.FRONTEND_API_URL),
  dev,
  serveStatic: process.env.FRONTEND_SERVE_STATIC !== "0",
};

function parseFrontendSettings(
  prefix: string,
  env: { [k: string]: string },
): IFrontendSettings {
  const getValue = (k) => env[`${prefix}${k}`];

  return {
    debounceDelayMs: parseInt(getValue("DEBOUNCE_DELAY_MS"), 10),
    enableAdminMode: getValue("ENABLE_ADMIN_MODE") === "1",
    randomStoryCount: parseInt(getValue("RANDOM_STORY_COUNT"), 10),
  };
}

createServer(
  createLogger(),
  parseInt(PORT, 10),
  SETTINGS,
  dev,
  parseFrontendSettings("FRONTEND_", process.env),
  REVISION,
  TIMESTAMP,
);
