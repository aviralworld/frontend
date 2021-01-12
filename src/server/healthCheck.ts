import type { RequestHandler } from "express";
import axios from "axios";

const CONTENT_TYPE = "application/json";

export default function healthCheck(
  revision: string,
  timestamp: string,
  apiEndpoint: string,
  apiHealthCheckTimeoutMs: number,
): RequestHandler {
  const info = {
    revision,
    timestamp,
  };

  return async (_req, res) => {
    let apiReachable = false;

    res.contentType(CONTENT_TYPE);
    res.status(200);

    try {
      apiReachable = await axios.get(apiEndpoint, {
        timeout: apiHealthCheckTimeoutMs,
      });
      apiReachable = true;
    } catch (e) {
      res.status(504);
    }

    res.send(JSON.stringify({ ...info, apiReachable }));
  };
}
