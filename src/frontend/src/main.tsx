import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

const root = document.getElementById("root")!
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Production pages are prerendered at build time (scripts/prerender.mjs): hydrate them.
// The Vite dev server serves an empty root: render from scratch.
if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, app)
} else {
  ReactDOM.createRoot(root).render(app)
}
