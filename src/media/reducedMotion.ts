// https://geoffrich.net/posts/svelte-prefers-reduced-motion-store/
import { readable } from "svelte/store";

const QUERY = "(prefers-reduced-motion: no-preference)";

const getInitialMotionPreference = () => !window.matchMedia(QUERY).matches;

export const reducedMotion = readable(getInitialMotionPreference(), (set) => {
  const mediaQueryList: MediaQueryList | undefined =
    typeof window !== "undefined" ? window.matchMedia(QUERY) : undefined;

  const updatePreference = (event: MediaQueryListEvent) => set(!event.matches);

  if (typeof window !== "undefined") {
    mediaQueryList.addEventListener("change", updatePreference);

    return () => {
      mediaQueryList.removeEventListener("change", updatePreference);
    };
  }
});
