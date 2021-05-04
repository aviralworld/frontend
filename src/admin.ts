import { Client, QueryResult } from "pg";

interface IRecordingToken {
  id: string;
  parent_id: string;
}

const { PG_CONNECTION_STRING } = process.env;

const OPEN_RECORDING_QUERY =
  "SELECT parent_id, id FROM open_recordings LIMIT 1";

export async function fetchOpenToken(): Promise<IRecordingToken> {
  const client = new Client({ connectionString: PG_CONNECTION_STRING });
  await client.connect();

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { rows } = (await client.query(
    OPEN_RECORDING_QUERY,
    [],
  )) as QueryResult<IRecordingToken>;

  const first: IRecordingToken = rows.shift();

  if (first === undefined) {
    throw new Error("No open recordings found");
  }

  return first;
}

interface IKey {
  id: string;
}

const FIRST_KEY_RECORDING = "SELECT id FROM recordings_management LIMIT 1";

export async function fetchFirstKey(): Promise<string> {
  const client = new Client({ connectionString: PG_CONNECTION_STRING });

  await client.connect();

  const { rows } = (await client.query(
    FIRST_KEY_RECORDING,
  ));

  const first = rows.shift();

  if (first === undefined) {
    throw new Error("No keys found");
  }

  return first.id;
}
