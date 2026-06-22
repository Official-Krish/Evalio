import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { App } from "./App";
import "./index.css";

const elem = document.getElementById("root")!;
const app = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
(import.meta.hot.data.root ??= createRoot(elem)).render(app);
