import type express from "express";
import proxy from "express-http-proxy";

import type { Logger } from "../logger";
import type { ISettings } from "./settings";

export default function createProxy(
  logger: Logger,
  settings: ISettings,
): express.RequestHandler {
  return proxy(settings.apiUrl.toString(), {
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
  });
}
