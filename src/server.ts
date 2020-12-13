import dotenvSafe from "dotenv-safe";

import { createLogger } from "./logger";
import { createServer } from "./server/create";

dotenvSafe.config();

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const SETTINGS = {
  apiUrl: new URL(process.env.FRONTEND_API_URL),
  dev,
  maxBodySizeInBytes: parseInt(process.env.FRONTEND_MAX_BODY_SIZE_IN_BYTES, 10),
  serveStatic: process.env.FRONTEND_SERVE_STATIC !== "0",
};

createServer(createLogger(), parseInt(PORT, 10), SETTINGS, dev);
