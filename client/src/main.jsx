import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { HelmetProvider } from "react-helmet-async";

const RouterWrapper = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 👇 Just wrap your existing component like this 👇 */}
    <HelmetProvider>
      <RouterWrapper />
    </HelmetProvider>
    {/* 👆 And you're all set 👆 */}
  </StrictMode>
);
