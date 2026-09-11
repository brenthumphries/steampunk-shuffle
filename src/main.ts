import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("#app root element is missing from index.html");
}

app.innerHTML = `
  <main class="taproom">
    <h1>The Wheatstone Bridge</h1>
    <p>The scaffold is up. The cards are still in the printer.</p>
  </main>
`;
