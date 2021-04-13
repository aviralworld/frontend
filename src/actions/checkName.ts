import type { Readable } from "svelte/store";

export function checkName(
  node: HTMLInputElement,
  inUse: Readable<boolean | undefined>,
) {
  const unsubscriber = inUse.subscribe((v) => {
    if (v) {
      node.setCustomValidity("There is already a recording under that name.");
      node.reportValidity();
    } else if (v !== undefined) {
      node.setCustomValidity("");
      node.reportValidity();
    }
  });

  return {
    destroy() {
      unsubscriber();
    },
  };
}
