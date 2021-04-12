import { Client, QueryResult } from "pg";

const { PG_CONNECTION_STRING } = process.env;

const QUERY = "SELECT parent_id, id FROM open_recordings LIMIT 1";

interface IResult {
  id: string;
  parent_id: string;
}

export async function fetchOpenToken(): Promise<IResult> {
  const client = new Client({ connectionString: PG_CONNECTION_STRING });
  await client.connect();

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { rows } = (await client.query(QUERY, [])) as QueryResult<IResult>;

  const first: IResult = rows.shift();

  if (first === undefined) {
    throw new Error("No open recordings found");
  }

  return first;
}
