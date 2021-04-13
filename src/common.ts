import type { ServerResponse } from "http";
import type { Request } from "express";

import ContentType from "./contentType";
import type { ISettings } from "./server/settings";

export function respond(
  response: ServerResponse,
  status: number,
  contentType: keyof typeof ContentType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  data: any,
): void {
  response.writeHead(status, {
    "Content-Type": ContentType[contentType],
  });

  response.end(data);
}

export interface IFrontendRequest extends Request {
  frontendSettings: ISettings;
}
