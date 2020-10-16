const SECONDS_PER_MINUTE = 60;

export function asMinutesAndSeconds(seconds: number): string {
  return `${pad(Math.floor(seconds / SECONDS_PER_MINUTE), 2)}:${pad(
    seconds % SECONDS_PER_MINUTE,
    2,
  )}`;
}

function pad(n: number, l: number): string {
  let result = n.toString();

  while (result.length < l) {
    result = `0${result}`;
  }

  return result;
}
