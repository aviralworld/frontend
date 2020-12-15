import sirv from "sirv";
import express from "express";
import proxy from "express-http-proxy";
import compression from "compression";
import * as sapper from "@sapper/server";

import type { Logger } from "../logger";
import type { ISettings } from "./settings";

export function createServer(
  logger: Logger,
  port: number,
  settings: ISettings,
  dev: boolean,
): express.Express {
  logger.info({ port, settings }, "Starting server on port %s...", port);

  const server = express();

  server.use(compression({ threshold: 0 }));

  server.use(async (req, _res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).frontendSettings = settings;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).logger = logger;
    logger.info({ path: req.path, params: req.params }, "Received request");
    next();
  });

  if (settings.serveStatic) {
    server.use(sirv("static", { dev }));
  }

  server.use(
    "/api",
    proxy(settings.apiUrl.toString(), {
      proxyErrorHandler: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        err: any,
        res: express.Response,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next: (err: any) => void,
      ) => {
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

  server.listen(port);

  return server;
}