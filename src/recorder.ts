export async function createRecorder(mimeType: string): Promise<MediaRecorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  return new MediaRecorder(stream, { mimeType });
}

export function findSupportedFormat(
  candidates: readonly string[],
): string | undefined {
  return candidates.find((f) => MediaRecorder.isTypeSupported(f));
}
