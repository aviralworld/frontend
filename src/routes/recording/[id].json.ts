import type { ServerResponse } from "http";

import axios from "axios";
import type { Request } from "polka";

import { SETTINGS } from "../../server";
import { ContentType, respond } from "../_common";

export async function get(
  req: Request,
  res: ServerResponse,
  _next: () => void,
) {
  const { id } = req.params;

  const response = await axios.get(new URL(id, SETTINGS.apiUrl).toString());

  if (response.status === 200) {
    respond(res, 200, ContentType.Json, response.data);
    return;
  }

  if (response.status === 404) {
    respond(res, 404, ContentType.Text, `Unknown recording ID: ${id}`);
  }

  respond(res, 500, ContentType.Text, "Unable to retrieve recording");
}
