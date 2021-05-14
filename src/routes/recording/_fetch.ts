import type { Option } from "../../types";
import type { PreloadContext } from "@sapper/common";

type Options = readonly Option[];

export interface IMetadata {
  ages: Options;
  categories: Options;
  formats: Options;
  genders: Options;
}

export class FetchError extends Error {
  constructor(readonly status: number, url: string) {
    super(`Got a ${status} response from ${url}`);
  }
}

export async function fetchMetadata(
  context: PreloadContext,
  apiUrl: string,
): Promise<IMetadata> {
  const f: (x: keyof IMetadata) => Promise<Response> = (k) =>
    context.fetch(`${apiUrl}/${k}/`);

  const responses: Record<keyof IMetadata, Promise<Response>> = {
    ages: f("ages"),
    categories: f("categories"),
    formats: f("formats"),
    genders: f("genders"),
  };

  await Promise.all(Object.values(responses));

  const objects: Partial<Record<keyof IMetadata, object>> = {};

  for (const [k, p] of Object.entries(responses)) {
    const r = await p;

    if (r.status !== 200) {
      throw new FetchError(r.status, r.url);
    }

    objects[k] = JSON.parse(await r.json()) as readonly Option[];
  }

  return objects as IMetadata;
}
