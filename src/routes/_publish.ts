const ENDPOINT = "/api/recordings/";

export async function publish(
  blob: Blob,
  details: Record<string, unknown>,
): Promise<string> {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", ENDPOINT, true);

  const fd = new FormData();
  console.log(JSON.stringify(details));
  fd.append("audio", blob);
  fd.append("metadata", JSON.stringify(details));

  xhr.send(fd);

  return new Promise((resolve, reject) => {
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 201) {
          resolve(JSON.parse(xhr.responseText).id);
        } else {
          reject(xhr.status);
        }
      }
    };
  });
}
