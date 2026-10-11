import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "./i18n.jsx";
import { ResearchProvider } from "./research.jsx";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <ResearchProvider>
          <App />
        </ResearchProvider>
      </BrowserRouter>
    </LanguageProvider>
  </StrictMode>,
);
