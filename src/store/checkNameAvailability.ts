import type { Readable } from "svelte/store";
import { derived } from "svelte/store";
import debouncePromise from "debounce-promise";

import { API_PATH } from "../paths";

interface IAvailability {
  available: boolean;
  checking: boolean;
}

export function isNameAvailableDebounced(
  name: Readable<string>,
  debounceMs: number,
): Readable<IAvailability> {
  const debounced = debouncePromise(isNameAvailable, debounceMs);

  let available = true;

  return derived(name, (v, set) => {
    if (!(process as any).browser) {
      set({ available, checking: false });
      return;
    }

    set({ available, checking: true });

    debounced(v)
      .then((v) => {
        available = v;

        set({
          available,
          checking: false,
        });
      })
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
