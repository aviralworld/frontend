// TODO this is static, but it should be updated based on the current value of
// the media query, using `media/reducedMotion.ts`
import {
  spring as svelte_spring,
  tweened as svelte_tweened,
} from "svelte/motion";
import { writable } from "svelte/store";

const reduce_motion = matchMedia("(prefers-reduced-motion: reduce)").matches;

export const spring = reduce_motion ? writable : svelte_spring;
export const tweened = reduce_motion ? writable : svelte_tweened;
