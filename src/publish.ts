import { PublishFailedError } from "./errors";
import { API_PATH } from "./paths";
import type { ISubmission } from "./types";

export const FORBIDDEN_CODE = 403;

const ENDPOINT = `${API_PATH}/`;

export async function publish(
  blob: Blob,
  details: ISubmission,
): Promise<unknown> {
  const fd = new FormData();
  fd.append("audio", blob);
  fd.append("metadata", JSON.stringify(details));

  const response = await fetch(ENDPOINT, {
    method: "POST",
    body: fd,
  });

  if (response.status === 201) {
    // TODO properly type response by parsing
    return await response.json();
  }

  throw new PublishFailedError(response.status);
}
