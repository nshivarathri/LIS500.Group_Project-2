import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
// Entry point: mounts the React app into <div id="root"> in index.html.
// StrictMode runs extra checks during development only; it has no effect on
// the built site.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
