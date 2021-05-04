import type { DBSchema, IDBPDatabase, OpenDBCallbacks } from "idb";
import { openDB } from "idb";

import type { IReply } from "../types";

export const DATABASE_NAME = "aviralworld";
export const DATABASE_VERSION = 1;

export interface IDb extends DBSchema {
  replies: {
    key: string;
    value: IReply;
  };
}

export const OPEN_DB_CALLBACKS: OpenDBCallbacks<IDb> = {
  upgrade: (db) => {
    db.createObjectStore("replies");
  },
};

export const open: () => Promise<IDBPDatabase<IDb>> = (() => {
  let db = undefined;

  return () => {
    if (db === undefined) {
      db = openDB<IDb>(DATABASE_NAME, DATABASE_VERSION, OPEN_DB_CALLBACKS);
    }

    return db;
  };
})();
