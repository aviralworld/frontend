declare global {
  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace Express {
    interface Request {
      settings?: ISettings;
    }
  }
}

export interface ISettings {
  adminPort: number;
  apiUrl: URL;
  healthCheckTimeoutMs: number;
  compression: boolean;
  dev: boolean;
  enableAdminMode: boolean;
  serveStatic: boolean;
}
