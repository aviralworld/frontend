import type { AddressInfo } from "net";
import type { Server } from "http";

import { addAsync } from "@awaitjs/express";
import compression from "compression";
import express from "express";
import sirv from "sirv";

import * as sapper from "@sapper/server";
import type { Logger } from "../logger";
import type { IFrontendSettings } from "./frontendSettings";
import healthCheck from "./healthCheck";
import createProxy from "./proxy";
import type { ISettings } from "./settings";

declare global {
  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace Express {
    interface Request {
      logger?: Logger;
    }
  }
}

export function createServer(
  logger: Logger,
  port: number,
  settings: ISettings,
  dev: boolean,
  frontendSettings: IFrontendSettings,
  revision: string,
  timestamp: string,
): express.Express {
  const server = addAsync(express());

  if (settings.compression) {
    logger.debug("Adding compression...");
    server.use(compression({ threshold: 0 }));
  }

  logger.debug("Adding logging and settings middleware...");
  server.use((req, _res, next) => {
    req.settings = settings;
    req.logger = logger;
    logger.info({ path: req.path, params: req.params }, "Received request");

    next();
  });

  if (settings.enableAdminMode) {
    logger.debug("Adding extra /admin routes...");

    const admin = import("../admin");

    // TODO this ought to be typed properly by @awaitjs/express,
    // see <https://github.com/vkarpov15/awaitjs-express/pull/25>
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    server.useAsync("/admin/new/", async (_req, res) => {
      const { fetchOpenToken } = await admin;
      const { parent_id, id } = await fetchOpenToken();

      res
        .status(302)
        .header(
          "Location",
          new URL(
            `/recording/${parent_id}/?token=${id}`,
            frontendSettings.baseUrl,
          ).toString(),
        )
        .send();
    });

    server.useAsync("/admin/key/", async (_req, res) => {
      const { fetchFirstKey } = await admin;
      const id = await fetchFirstKey();

      res
        .status(302)
        .header(
          "Location",
          new URL(`/lookup/${id}/`, frontendSettings.baseUrl).toString(),
        )
        .send();
    });
  } else {
    logger.debug("Adding guard for /admin...");
    server.use("/admin", (_req, res) => {
      res.status(403).send();
    });
  }

  if (settings.serveStatic) {
    logger.debug("Adding sirv...");
    server.use("/static", sirv("static", { dev }));
  }

  logger.debug("Adding API proxy...");
  server.use("/api", createProxy(logger, settings));

  logger.debug("Adding Sapper...");
  server.use(
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
    sapper.middleware({
      session: () => ({
        frontendSettings,
      }),
    }),
  );

  logger.debug("Binding to port %s...", port);
  const app = server.listen(port);

  logger.debug("Getting address...");
  const [listeningAddress, listeningPort] = getAddress(app);

  const adminServer = express();
  adminServer.use(
    "/healthz",
    healthCheck(
      revision,
      timestamp,
      `${settings.apiUrl.toString()}recordings/random/1`,
      settings.healthCheckTimeoutMs,
    ),
  );

  adminServer.listen(settings.adminPort);

  logger.info(
    {
      address: listeningAddress,
      adminPort: settings.adminPort,
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
