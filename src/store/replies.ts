import type { Subscriber, Writable } from "svelte/store";
import { writable } from "svelte/store";
import type { IReply } from "../types";
import { open } from "./db";

const STORE = "replies";

const CACHE = new Map();

export function reply(recordingId: string): Writable<IReply> {
  if (!CACHE.has(recordingId)) {
    CACHE.set(recordingId, newReply(recordingId));
  }

  return CACHE.get(recordingId);
}

function newReply(recordingId: string): Writable<IReply | undefined> {
  let value = undefined;

  if (!(process as any).browser) {
    return writable(undefined);
  }

  if (!window.indexedDB) {
    console.warn("IndexedDB not available, persistence disabled");
    return writable(undefined);
  }

  let db = open();

  const set = async (v: IReply) => {
    const p = (await db).put(STORE, v, recordingId).then(() => {});
    pending.push(p);
    await p;
    pending.splice(
      pending.findIndex((p2) => p === p2),
      1,
    );
    value = v;

    listeners.forEach((l) => {
      l(v);
    });
  };

  db.then(async (db) => {
    try {
      set(await db.get(STORE, recordingId));
    } catch (e) {
      console.error(e);
    }
  });

  const listeners: Subscriber<IReply>[] = [];
  const pending: Promise<void>[] = [];

  return {
    subscribe: (l) => {
      listeners.push(l);
      l(value);
      return () => {
        listeners.splice(
          listeners.findIndex((l2) => l === l2),
          1,
        );
      };
    },
    update: async (updater) => {
      await Promise.all(pending);
      set(updater(value));
    },
    set,
  };
}
