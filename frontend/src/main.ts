import { createElement } from "react";
import ReactDOM from "react-dom/client";
import Login from "./pages/authentication/Login";

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element with id 'app' was not found.");
}

ReactDOM.createRoot(rootElement).render(createElement(Login));
