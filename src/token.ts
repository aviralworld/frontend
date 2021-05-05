import type { PreloadContext } from "@sapper/common";

export type IVerificationResult =
  | IVerifiedToken
  | ITokenVerificationError
  | undefined;

export interface IVerifiedToken {
  token: string;
}

export interface ITokenVerificationError {
  status: number;
  message: string;
}

export async function verifyToken(
  preload: PreloadContext.PreloadContext,
  value: string,
  currentId: string,
): Promise<IVerificationResult> {
  if (value === undefined) {
    return undefined;
  }

  const r: Response = (await preload.fetch(
    `/api/recordings/token/${value}/`,
  )) as Response;

  if (r.status === 404 || r.status === 400) {
    return {
      status: 400,
      message: `Token ${value} does not exist`,
    };
  }

  if (r.status === 200) {
    const { parent_id: parentId } = await r.json();

    if (parentId !== currentId) {
      return {
        status: 400,
        message: `Token ${value} cannot be used with this recording`,
      };
    }
  }

  return {
    token: value,
  };
}
