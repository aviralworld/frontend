export async function createRecorder(mimeType: string): Promise<MediaRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  return new MediaRecorder(stream, { mimeType });
}

const SUPPORTED_FORMAT_KEY = "supported-format";

export function retrieveSupportedFormat(
  candidates: readonly string[],
): string | null {
  if (localStorage === undefined) {
    return findSupportedFormat(candidates);
  }

  if (localStorage[SUPPORTED_FORMAT_KEY] === undefined) {
    localStorage[SUPPORTED_FORMAT_KEY] = findSupportedFormat(candidates);
  }

  return localStorage[SUPPORTED_FORMAT_KEY];
}

function findSupportedFormat(candidates: readonly string[]): string | null {
  return candidates.find((f) => MediaRecorder.isTypeSupported(f)) || null;
}

export function makeRecordingUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}
