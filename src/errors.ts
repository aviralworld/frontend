export class PublishFailedError extends Error {
  constructor(readonly code: number) {
    super(`Publish failed with status ${code}`);
  }
}
