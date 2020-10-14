import type { ServerResponse } from "http";

export function respond(
  response: ServerResponse,
  status: number,
  contentType: ContentType,
  data: any,
) {
  response.writeHead(status, {
    "Content-Type": contentType,
  });

  response.end(data);
}

export const enum ContentType {
  Json = "application/json",
  Text = "text/plain",
}

export interface IRecording {}
