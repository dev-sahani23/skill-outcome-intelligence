import "./styles/index.css";
import "./lib/i18n";
import { createElement } from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./app/Router";
import { ErrorBoundary } from "./components/ErrorBoundary";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in react-leaflet in Vite builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element with id 'app' was not found.");
}

ReactDOM.createRoot(rootElement).render(
  createElement(ErrorBoundary, null, createElement(AppRouter))
);
