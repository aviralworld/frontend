export function asLocationString(location: string): string {
  return location !== null ? ` from ${location}` : "";
}
