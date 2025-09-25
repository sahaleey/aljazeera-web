import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { HelmetProvider } from "react-helmet-async";

// 1️⃣ Import Sentry for React
import * as Sentry from "@sentry/react";

// 2️⃣ Initialize Sentry
Sentry.init({
  dsn: "https://e93b45cf3116b77e22eefee428196049@o4509545959260160.ingest.de.sentry.io/4510069928755280",
  sendDefaultPii: true, // optional: tracks user info like IP automatically
});

// 3️⃣ Optional: Error Boundary for top-level crash handling
const SentryErrorBoundary = Sentry.withErrorBoundary(App, {
  fallback: <h2>Something went wrong. Our team has been notified.</h2>,
});

const RouterWrapper = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SentryErrorBoundary />
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <RouterWrapper />
    </HelmetProvider>
  </StrictMode>
);
