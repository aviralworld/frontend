import dotenvSafe from "dotenv-safe";
import sirv from "sirv";
import express from "express";
import proxy from "express-http-proxy";
import compression from "compression";
import * as sapper from "@sapper/server";

import { createLogger } from "./logger";

dotenvSafe.config();

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const SETTINGS = {
  apiUrl: new URL(process.env.FRONTEND_API_URL),
  dev,
  maxBodySizeInBytes: process.env.FRONTEND_MAX_BODY_SIZE_IN_BYTES,
  serveStatic: process.env.FRONTEND_SERVE_STATIC !== "0",
};

const logger = createLogger();

logger.info(
  { PORT, SETTINGS },
  "Starting server on port %s...",
  parseInt(PORT, 10).toLocaleString(),
);

const server = express();

server.use(compression({ threshold: 0 }));

server.use(async (req, _res, next) => {
  (req as any).frontendSettings = SETTINGS;
  (req as any).logger = logger;
  logger.info({ path: req.path, params: req.params }, "Received request");
  next();
});

if (SETTINGS.serveStatic) {
  server.use(sirv("static", { dev }));
}

server.use(
  "/api",
  proxy(SETTINGS.apiUrl.toString(), {
    proxyErrorHandler: (err: any, res: express.Response, next: Function) => {
      switch (err && err.code) {
        case "ECONNRESET":
        case "ECONNREFUSED": {
          res.status(502).send("Unable to communicate with backend");
          break;
        }
        default: {
          next(err);
        }
      }
    },
  }),
);

server.use(sapper.middleware());

server.listen(PORT);
