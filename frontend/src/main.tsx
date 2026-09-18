import "./styles/index.css";
import "./lib/i18n";
import { createElement } from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./app/Router";

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element with id 'app' was not found.");
}

ReactDOM.createRoot(rootElement).render(createElement(AppRouter));
