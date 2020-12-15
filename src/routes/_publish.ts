const ENDPOINT = "/api/recordings/";

export async function publish(
  blob: Blob,
  details: Record<string, unknown>,
): Promise<unknown> {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", ENDPOINT, true);

  const fd = new FormData();
  fd.append("audio", blob);
  fd.append("metadata", JSON.stringify(details));

  xhr.send(fd);

  return new Promise((resolve, reject) => {
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 201) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(xhr.status);
        }
      }
    };
  });
}
