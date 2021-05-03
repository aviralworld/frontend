import { Readable, readable } from "svelte/store";

export const enum MicrophoneStatus {
  DENIED,
  GRANTED,
  PROMPT,
  UNAVAILABLE,
  UNKNOWN,
}

export function microphonePermission(): Readable<MicrophoneStatus> {
  return readable<MicrophoneStatus>(MicrophoneStatus.UNKNOWN, (set) => {
    let result: PermissionStatus;

    const { permissions } = navigator;

    if (!permissions) {
      set(MicrophoneStatus.UNAVAILABLE);
      return;
    }

    const listener = function (this: PermissionStatus) {
      set(parsePermissionState(this.state));
    };

    void (async () => {
      result = await navigator.permissions.query({ name: "microphone" });
      result.addEventListener("change", listener);

      set(parsePermissionState(result.state));
    })();

    return () => {
      result.removeEventListener("change", listener);
    };
  });
}

function parsePermissionState(state: string): MicrophoneStatus {
  switch (state) {
    case "granted":
      return MicrophoneStatus.GRANTED;
    case "prompt":
      return MicrophoneStatus.PROMPT;
    default:
      return MicrophoneStatus.DENIED;
  }
}
