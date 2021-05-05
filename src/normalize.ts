const WHITESPACE_RE = /\s+/g;

const NORMALIZE = typeof String.prototype.normalize === "function";

export function normalizeName(name: string): string {
  const trimmed = name.trim();
  const normalized = NORMALIZE ? trimmed.normalize() : trimmed;
  return normalized.replace(WHITESPACE_RE, " ");
}

export function trim(v: string | null): string | null {
  if (v === null) {
    return v;
  }

  const trimmed = v.trim();

  if (trimmed === "") {
    return null;
  }

  return trimmed;
}

export function parseDecimalInt(v: string): number {
  return parseInt(v, 10);
}
