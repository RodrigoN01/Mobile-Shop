import { render, screen, cleanup, waitFor } from "@testing-library/react";
import {
  ProductDetailsProvider,
  useProductDetails,
} from "../ProductDetailsContext";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

const mockProductDetails = {
  id: "1",
  brand: "Apple",
  model: "iPhone 14",
  price: "999",
  imgUrl: "/image1.jpg",
};

const TestComponent = ({ id }: { id: string }) => {
  const { product, loading, error, fetchProductDetails } =
    useProductDetails();

  return (
    <div>
      <button onClick={() => fetchProductDetails(id)}>Fetch</button>
      <p>Loading: {loading.toString()}</p>
      <p>Error: {error || "none"}</p>
      <p>Product: {product ? product.model : "none"}</p>
    </div>
  );
};

describe("ProductDetailsContext", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("starts with no product and not loading", () => {
    render(
      <ProductDetailsProvider>
        <TestComponent id="1" />
      </ProductDetailsProvider>
    );

    expect(screen.getByText("Loading: false")).toBeInTheDocument();
    expect(screen.getByText("Product: none")).toBeInTheDocument();
    expect(screen.getByText("Error: none")).toBeInTheDocument();
  });

  it("fetches and displays the product details successfully", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProductDetails,
    } as Response);

    render(
      <ProductDetailsProvider>
        <TestComponent id="1" />
      </ProductDetailsProvider>
    );

    screen.getByText("Fetch").click();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://itx-frontend-test.onrender.com/api/product/1"
    );

    await waitFor(() => {
      expect(screen.getByText("Loading: false")).toBeInTheDocument();
    });

    expect(screen.getByText("Product: iPhone 14")).toBeInTheDocument();
    expect(screen.getByText("Error: none")).toBeInTheDocument();
  });

  it("handles a fetch error", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    render(
      <ProductDetailsProvider>
        <TestComponent id="1" />
      </ProductDetailsProvider>
    );

    screen.getByText("Fetch").click();

    await waitFor(() => {
      expect(screen.getByText("Loading: false")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Error: ❌ Failed to fetch product details")
    ).toBeInTheDocument();
    expect(screen.getByText("Product: none")).toBeInTheDocument();
  });

  it("throws when used outside of a ProductDetailsProvider", () => {
    const ConsumerOutsideProvider = () => {
      useProductDetails();
      return null;
    };

    expect(() => render(<ConsumerOutsideProvider />)).toThrow(
      "useProductDetails must be used within a ProductDetailsProvider"
    );
  });
});
