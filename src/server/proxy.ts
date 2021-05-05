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
      err: unknown,
      res: express.Response,
      next: (err: unknown) => void,
    ) => {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
      const code = getCode(err);
      switch (code) {
        case "ECONNRESET":
        case "ECONNREFUSED": {
          const { req } = res;
          logger.warn(
            { path: req.path, params: req.params, err },
            "Error communicating with backend: %s",
            err as any,
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

function getCode(err: unknown): string | number | undefined {
  if (typeof err !== "object") {
    return undefined;
  }

  return (err as { code: string | number }).code;
}
