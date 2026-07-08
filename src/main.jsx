import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import AppProviders from "./app/providers";
import { initServerStatusFromLocation } from "@/services/serverStatus";
import "@/services/toastStore";
import "@/i18n";
import "@/shared/styles/global.css";
import "./global.css"
import "./styles/theme.css";
import "./styles/dropdown-z-index.css";
import "@/shared/styles/responsive.css";
import "./styles/z-index-layers.css";

initServerStatusFromLocation();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
);
