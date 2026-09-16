import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ProductProvider } from "./context/ProductContext";
import { ProductDetailsProvider } from "./context/ProductDetailsContext";
import { CartProvider } from "./context/CartContext";
import App from "./App";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

const renderApp = (initialEntries: string[]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ProductProvider>
        <ProductDetailsProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ProductDetailsProvider>
      </ProductProvider>
    </MemoryRouter>
  );
};

describe("App", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);
    globalThis.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders the header", async () => {
    renderApp(["/"]);
    expect(screen.getByText("Mobile Shop")).toBeInTheDocument();
  });

  it("shows the search bar on the home route", async () => {
    renderApp(["/"]);
    expect(
      screen.getByPlaceholderText("Search for smartphones...")
    ).toBeInTheDocument();
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
  });

  it("shows the back button on the cart route", async () => {
    renderApp(["/cart"]);
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Search for smartphones...")
    ).not.toBeInTheDocument();
  });

  it("renders the cart page content on the /cart route", async () => {
    renderApp(["/cart"]);
    await waitFor(() => {
      expect(screen.getByText(/Cart \(\d+\)/)).toBeInTheDocument();
    });
  });

  it("renders the home page content on the / route", async () => {
    renderApp(["/"]);
    await waitFor(() => {
      expect(screen.getByText("No products found.")).toBeInTheDocument();
    });
  });
});
