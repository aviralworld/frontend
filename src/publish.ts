import { API_PATH } from "./paths";
import type { ISubmission } from "./types";

export const FORBIDDEN_CODE = 403;

const ENDPOINT = "${API_PATH}/recordings/";

export async function publish(
  blob: Blob,
  details: ISubmission,
): Promise<unknown> {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", ENDPOINT, true);

  const fd = new FormData();
  fd.append("audio", blob);
  fd.append("metadata", JSON.stringify(details));

  await runXhrAsPromise(xhr, fd);

  // TODO properly type response by parsing
  return JSON.parse(xhr.responseText);
}

function runXhrAsPromise(xhr: XMLHttpRequest, fd?: FormData): Promise<boolean> {
  return new Promise((resolve, reject) => {
    xhr.send(fd);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 201) {
          resolve(true);
        } else {
          reject(xhr.status);
        }
      }
    };
  });
}
