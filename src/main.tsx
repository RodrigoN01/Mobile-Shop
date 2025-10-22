import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { ProductProvider } from "./context/ProductContext.tsx";
import { ProductDetailsProvider } from "./context/ProductDetailsContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ProductProvider>
        <ProductDetailsProvider>
          <App />
        </ProductDetailsProvider>
      </ProductProvider>
    </BrowserRouter>
  </StrictMode>
);
