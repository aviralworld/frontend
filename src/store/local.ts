import type { Writable } from "svelte/store";
import { writable as _writable } from "svelte/store";
import { writable } from "svelte-persistent-store/dist/local.js";

const CACHE = new Map();

export function simple<T>(
  recordingId: string | undefined,
  key: string,
  initial: T,
): Writable<T> {
  if (recordingId === undefined) {
    return _writable(initial);
  }

  const full = fullKey(recordingId, key);

  if (!CACHE.has(full)) {
    CACHE.set(full, writable(full, initial));
  }

  return CACHE.get(full) as Writable<T>;
}

function fullKey(recordingId: string, property: string): string {
  return `${recordingId}-${property}`;
}
