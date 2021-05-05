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
    res.contentType(CONTENT_TYPE);
    res.status(200);

    const [apiStatus, error] = await tryApi(
      apiEndpoint,
      apiHealthCheckTimeoutMs,
    );

    res.send(JSON.stringify({ ...info, api: { status: apiStatus, error } }));
  };
}

async function tryApi(
  endpoint: string,
  timeout: number,
): Promise<[number, any]> {
  try {
    const response = await axios.get(endpoint, {
      timeout: timeout,
    });

    return [response.status, undefined];
  } catch (e) {
    return [e.reponse?.status, e];
  }
}
