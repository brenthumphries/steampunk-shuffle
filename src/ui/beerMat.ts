// The beer mat: Sir Charles's narration device (design.md §13.1 — "he
// communicates anything important by writing it on a beer mat and sliding
// it across"), reused for the plain hint chips of §13.3 too since they're
// the same slide-in/tap-to-dismiss shape. Deliberately not a full-screen
// overlay: it must never block a legal move underneath it.

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function buildBeerMat(text: string, onDismiss: () => void): HTMLElement {
  const mat = el("div", "beer-mat");
  mat.appendChild(el("p", "beer-mat-text", text));
  const dismiss = el("button", "beer-mat-dismiss", "×");
  dismiss.type = "button";
  dismiss.setAttribute("aria-label", "Dismiss");
  dismiss.addEventListener("click", onDismiss);
  mat.appendChild(dismiss);
  return mat;
}
