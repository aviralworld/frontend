import { Readable, readable } from "svelte/store";

export const enum MicrophoneStatus {
  DENIED,
  GRANTED,
  PROMPT,
  UNKNOWN,
}

export function microphonePermission(): Readable<MicrophoneStatus> {
  return readable<MicrophoneStatus>(MicrophoneStatus.UNKNOWN, (set) => {
    let result: PermissionStatus;

    const listener = function (this: PermissionStatus) {
      set(isPermitted(this.state));
    };

    void (async () => {
      result = await navigator.permissions.query({ name: "microphone" });
      result.addEventListener("change", listener);

      set(isPermitted(result.state));
    })();

    return () => {
      result.removeEventListener("change", listener);
    };
  });
}

function isPermitted(state: string): MicrophoneStatus {
  switch (state) {
    case "granted":
      return MicrophoneStatus.GRANTED;
    case "prompt":
      return MicrophoneStatus.PROMPT;
    default:
      return MicrophoneStatus.DENIED;
  }
}
