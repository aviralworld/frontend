import { default as log, LoggerType } from "roarr";
import type * as roarr from "roarr";
import { serializeError } from "serialize-error";

export const NAMESPACE_SEPARATOR = ".";

const IN_BROWSER = typeof window !== "undefined";

const HOSTNAME = IN_BROWSER ? window.location.host : require("os").hostname();
const PID = process?.pid;

// A wrapper around the [`Roarr.Logger`] type minus the call
// signatures. Adds the [`withChildNamespace`] method.
export class Logger {
  public trace: roarr.Logger;
  public debug: roarr.Logger;
  public info: roarr.Logger;
  public warn: roarr.Logger;
  public error: roarr.Logger;
  public fatal: roarr.Logger;

  constructor(protected readonly _logger: LoggerType) {
    this.trace = _logger.trace;
    this.debug = _logger.debug;
    this.info = _logger.info;
    this.warn = _logger.warn;
    this.error = _logger.error;
    this.fatal = _logger.fatal;
  }

  public child(
    contextOrFunction:
      | roarr.TranslateMessageFunctionType
      | roarr.MessageContextType,
  ): Logger {
    return new Logger(this._logger.child(contextOrFunction));
  }

  public getContext(): roarr.MessageContextType {
    return this._logger.getContext();
  }

  public withChildNamespace(newNamespace: string): Logger {
    const oldNs = this.getContext().namespace;

    const newComponents =
      oldNs === undefined
        ? []
        : oldNs.split(NAMESPACE_SEPARATOR).concat([newNamespace]);

    return this.child({
      namespace: newComponents.join(NAMESPACE_SEPARATOR),
    });
  }
}

export function createLogger(
  values: Record<string, unknown> = {},
  errorIfSuppressed = false,
): Logger {
  if (process.env.ROARR_LOG !== "true" && errorIfSuppressed) {
    throw new Error(`ROARR_LOG must be set to \`true\``);
  }

  return new Logger(
    log
      .child({
        application: "frontend",
        hostname: HOSTNAME,
        pid: PID,
        ...values,
      })
      .child((message) => {
        const { context } = message;

        if ("error" in context) {
          context.error = serializeError(context.error);
        }

        return message;
      }),
  );
}
