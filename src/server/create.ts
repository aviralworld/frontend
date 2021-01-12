import type { AddressInfo } from "net";
import type { Server } from "http";

import sirv from "sirv";
import express from "express";
import compression from "compression";
import * as sapper from "@sapper/server";

import type { Logger } from "../logger";
import type { IFrontendSettings } from "./frontendSettings";
import createProxy from "./proxy";
import type { ISettings } from "./settings";

export function createServer(
  logger: Logger,
  port: number,
  settings: ISettings,
  dev: boolean,
  frontendSettings: IFrontendSettings,
  revision: string,
  timestamp: string,
): express.Express {
  const server = express();

  if (settings.compression) {
    server.use(compression({ threshold: 0 }));
  }

  server.use((req, _res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).settings = settings;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).logger = logger;
    logger.info({ path: req.path, params: req.params }, "Received request");

    next();
  });

  if (!settings.enableAdminMode) {
    server.use("/admin", (_req, res) => {
      res.status(403).send();
    });
  }

  if (settings.serveStatic) {
    server.use("/static", sirv("static", { dev }));
  }

  server.use("/api", createProxy(logger, settings));

  server.use(
    sapper.middleware({
      session: () => ({
        frontendSettings,
      }),
    }),
  );

  const app = server.listen(port);
  const [listeningAddress, listeningPort] = getAddress(app);

  logger.info(
    {
      address: listeningAddress,
      port: listeningPort,
      settings,
      revision,
      timestamp,
    },
    "Server listening on port %s...",
    listeningPort,
  );

  return server;
}

function getAddress(app: Server): [string, number] {
  const address = app.address() as AddressInfo;
  const listeningPort = address.port;
  const listeningAddress = address.address;

  return [listeningAddress, listeningPort];
}
