import sirv from "sirv";
import express from "express";
import proxy from "express-http-proxy";
import compression from "compression";
import * as sapper from "@sapper/server";

import type { Logger } from "../logger";

export function createServer(
  logger: Logger,
  port: number,
  settings: any,
  dev: boolean,
): express.Express {
  logger.info({ port, settings }, "Starting server on port %s...", port);

  const server = express();

  server.use(compression({ threshold: 0 }));

  server.use(async (req, _res, next) => {
    (req as any).frontendSettings = settings;
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

  server.listen(port);

  return server;
}
