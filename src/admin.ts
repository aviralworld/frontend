import { Client } from "pg";

const { PG_CONNECTION_STRING } = process.env;

const QUERY = "SELECT parent_id, id FROM open_recordings LIMIT 1";

export async function fetchOpenToken() {
  const client = new Client({ connectionString: PG_CONNECTION_STRING });
  await client.connect();

  const { rows } = await client.query(QUERY);

  const first = rows.shift();

  if (first === undefined) {
    throw new Error("No open recordings found");
  }

  return first;
}
