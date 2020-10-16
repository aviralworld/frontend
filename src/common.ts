import type { ServerResponse } from "http";

import type { Request } from "express";
import ContentType from "./contentType";

export function respond(
  response: ServerResponse,
  status: number,
  contentType: keyof typeof ContentType,
  data: any,
) {
  response.writeHead(status, {
    "Content-Type": ContentType[contentType],
  });

  response.end(data);
}

export interface IRecording {}

export interface IFrontendRequest extends Request {
  frontendSettings: any;
}
