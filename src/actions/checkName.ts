import type { Readable } from "svelte/store";

export function checkName(node: HTMLInputElement, inUse: Readable<boolean>) {
  const unsubscriber = inUse.subscribe((v) => {
    if (v) {
      node.setCustomValidity(
        "Sorry, there is already a recording under that name.",
      );
      node.reportValidity();
    } else {
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
