import type { Subscriber, Readable, Writable } from "svelte/store";
import { get, readable, writable } from "svelte/store";
import type { IReply } from "../types";
import { open } from "./db";

const STORE = "replies";

const CACHE = new Map();

export function readOnlyReply(
  reply: Promise<Writable<IReply>>,
): Readable<IReply | undefined> {
  return readable(undefined, (set) => {
    reply.then((v) => {
      set(get(v));

      v.subscribe(set);
    });
  });
}

export async function reply(recordingId: string): Promise<Writable<IReply>> {
  if (!CACHE.has(recordingId)) {
    CACHE.set(recordingId, replyFor(recordingId));
  }

  return CACHE.get(recordingId);
}

async function replyFor(recordingId: string): Promise<Writable<IReply>> {
  const store = writable(undefined);

  if (!window.indexedDB) {
    console.warn("IndexedDB not available, persistence disabled");
    return store;
  }

  const db = await open();

  try {
    store.set(await db.get(STORE, recordingId));
  } catch (e) {
    console.error(e);
  }

  const listeners: Subscriber<IReply>[] = [];
  const pending: Promise<void>[] = [];

  const set = async (v: IReply) => {
    const p = db.put(STORE, v, recordingId).then(() => {});
    pending.push(p);
    await p;
    pending.splice(
      pending.findIndex((p2) => p === p2),
      1,
    );
    store.set(v);
    listeners.forEach((l) => {
      l(v);
    });
  };

  return {
    subscribe: (l) => {
      listeners.push(l);
      return () => {
        listeners.splice(
          listeners.findIndex((l2) => l === l2),
          1,
        );
      };
    },
    update: async (updater) => {
      await Promise.all(pending);
      set(updater(get(store)));
    },
    set,
  };
}
