import type { AddressInfo } from "net";

import sirv from "sirv";
import express from "express";
import proxy from "express-http-proxy";
import compression from "compression";
import * as sapper from "@sapper/server";

import type { IFrontendSettings } from "./frontendSettings";
import type { Logger } from "../logger";
import type { ISettings } from "./settings";

export function createServer(
  logger: Logger,
  port: number,
  settings: ISettings,
  dev: boolean,
  frontendSettings: IFrontendSettings,
): express.Express {
  const server = express();

  server.use(compression({ threshold: 0 }));

  server.use(async (req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).settings = settings;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).logger = logger;
    logger.info({ path: req.path, params: req.params }, "Received request");

    if (req.path.indexOf("/admin") === 0 && !frontendSettings.enableAdminMode) {
      res.status(403).send();
    } else {
      next();
    }
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
            const { req } = res;
            logger.warn(
              { path: req.path, params: req.params, err },
              "Error communicating with backend: %s",
              err,
            );
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

  server.use(
    sapper.middleware({
      session: () => ({
        frontendSettings,
      }),
    }),
  );

  const app = server.listen(port);

  const address = app.address() as AddressInfo;
  const listeningPort = address.port;
  const listeningAddress = address.address;
  logger.info(
    { address: listeningAddress, port: listeningPort, settings },
    "Server listening on port %s...",
    listeningPort,
  );

  return server;
}
