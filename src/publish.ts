const ENDPOINT = "/api/recordings/";

const WHITESPACE_RE = /\s+/g;

const NORMALIZE = typeof String.prototype.normalize === "function";

export function normalizeName(name: string): string {
  const trimmed = name.trim();
  const normalized = NORMALIZE ? trimmed.normalize() : trimmed;
  return normalized.replace(WHITESPACE_RE, " ");
}

export async function publish(
  blob: Blob,
  details: Record<string, unknown>,
): Promise<unknown> {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", ENDPOINT, true);

  details["name"] = normalizeName(details["name"] as string);

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
