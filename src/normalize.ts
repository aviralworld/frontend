const WHITESPACE_RE = /\s+/g;

const NORMALIZE = typeof String.prototype.normalize === "function";

export function normalizeName(name: string): string {
  const trimmed = name.trim();
  const normalized = NORMALIZE ? trimmed.normalize() : trimmed;
  return normalized.replace(WHITESPACE_RE, " ");
}
