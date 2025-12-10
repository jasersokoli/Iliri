export function injectPrintTitle() {
  const title = document.createElement("div");
  title.id = "custom-print-title";
  title.innerText = "Iliri – Inventory Management";

  document.body.prepend(title);

  // remove after printing
  setTimeout(() => {
    title.remove();
  }, 1500);
}
