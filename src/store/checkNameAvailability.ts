import type { Readable } from "svelte/store";
import { derived } from "svelte/store";
import debouncePromise from "debounce-promise";

import { API_PATH } from "../paths";

interface IAvailability {
  available: Availability;
  checking: boolean;
}

export const enum Availability {
  AVAILABLE,
  UNAVAILABLE,
  ERROR,
}

export function isNameAvailableDebounced(
  name: Readable<string>,
  debounceMs: number,
): Readable<IAvailability> {
  const debounced = debouncePromise(isNameAvailable, debounceMs);

  let available = Availability.AVAILABLE;

  return derived(name, (v, set) => {
    if (!(process as any).browser) {
      set({ available, checking: false });
      return;
    }

    if (v === null || v.trim().length === 0) {
      set({ available, checking: false });
      return;
    }

    set({ available, checking: true });

    debounced(v)
      .then(
        (v) => {
          available = v ? Availability.AVAILABLE : Availability.UNAVAILABLE;

          set({
            available,
            checking: false,
          });
        },
        (_e) => {
          available = Availability.ERROR;
          set({ available, checking: false });
        },
      )
      .catch(console.error);
  });
}

async function isNameAvailable(name: string): Promise<boolean> {
  if (!(process as any).browser) {
    return false;
  }

  const params = new URLSearchParams({ name });
  const response = await fetch(`${API_PATH}/available/?${params.toString()}`);

  return response.status === 200;
}
