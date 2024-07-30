export function createShowEvent() {
  return new CustomEvent("wc-lightbox-show", {
    bubbles: true,
    composed: true,
  });
}
