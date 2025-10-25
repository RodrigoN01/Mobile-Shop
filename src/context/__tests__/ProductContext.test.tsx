import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { ProductProvider, useProducts } from "../ProductContext";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

const mockProducts = [
  {
    id: "1",
    brand: "Apple",
    model: "iPhone 14",
    price: "999",
    imgUrl: "/image1.jpg",
    options: {
      colors: [{ code: 1, name: "Black" }],
      storages: [{ code: 128, name: "128GB" }],
    },
  },
  {
    id: "2",
    brand: "Samsung",
    model: "Galaxy S23",
    price: "899",
    imgUrl: "/image2.jpg",
    options: {
      colors: [{ code: 1, name: "White" }],
      storages: [{ code: 256, name: "256GB" }],
    },
  },
];

const TestComponent = () => {
  const { products, loading, error } = useProducts();
  return (
    <div>
      <p>Loading: {loading.toString()}</p>
      <p>Error: {error || "none"}</p>
      <p>Products: {products.length}</p>
    </div>
  );
};

describe("ProductContext", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("should fetch and display products successfully", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    } as Response);

    render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>
    );

    expect(screen.getByText("Loading: true")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Loading: false")).toBeInTheDocument();
    });

    expect(screen.getByText("Products: 2")).toBeInTheDocument();
    expect(screen.getByText("Error: none")).toBeInTheDocument();
  });

  it("should handle fetch error", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Loading: false")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Error: ❌ Failed to fetch products")
    ).toBeInTheDocument();
    expect(screen.getByText("Products: 0")).toBeInTheDocument();
  });
});
