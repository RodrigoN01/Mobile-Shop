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
  options: {
    colors: [{ code: 1, name: "Black" }],
    storages: [{ code: 128, name: "128GB" }],
  },
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
      "https://itx-frontend-test.onrender.com/api/product/1",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
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

  it("serves a previously fetched product from cache", async () => {
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
    await waitFor(() => {
      expect(screen.getByText("Product: iPhone 14")).toBeInTheDocument();
    });

    screen.getByText("Fetch").click();
    await waitFor(() => {
      expect(screen.getByText("Product: iPhone 14")).toBeInTheDocument();
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("ignores a stale response when a newer request was made", async () => {
    let resolveFirst!: (value: Response) => void;
    vi.mocked(globalThis.fetch)
      .mockReturnValueOnce(
        new Promise<Response>((resolve) => {
          resolveFirst = resolve;
        })
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockProductDetails, id: "2", model: "Pixel 8" }),
      } as Response);

    const Racer = () => {
      const { product, fetchProductDetails } = useProductDetails();
      return (
        <div>
          <button onClick={() => fetchProductDetails("1")}>Fetch 1</button>
          <button onClick={() => fetchProductDetails("2")}>Fetch 2</button>
          <p>Product: {product ? product.model : "none"}</p>
        </div>
      );
    };

    render(
      <ProductDetailsProvider>
        <Racer />
      </ProductDetailsProvider>
    );

    screen.getByText("Fetch 1").click();
    screen.getByText("Fetch 2").click();
    await waitFor(() => {
      expect(screen.getByText("Product: Pixel 8")).toBeInTheDocument();
    });

    // The slower, superseded response arrives last and must be ignored.
    resolveFirst({ ok: true, json: async () => mockProductDetails } as Response);
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByText("Product: Pixel 8")).toBeInTheDocument();
  });

  it("URL-encodes the product id", async () => {
    vi.mocked(globalThis.fetch).mockReturnValue(new Promise(() => {}));

    render(
      <ProductDetailsProvider>
        <TestComponent id="../cart" />
      </ProductDetailsProvider>
    );
    screen.getByText("Fetch").click();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://itx-frontend-test.onrender.com/api/product/..%2Fcart",
      expect.anything()
    );
  });

  it("rejects responses that don't match the expected shape", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "1" }),
    } as Response);

    render(
      <ProductDetailsProvider>
        <TestComponent id="1" />
      </ProductDetailsProvider>
    );
    screen.getByText("Fetch").click();

    await waitFor(() => {
      expect(
        screen.getByText("Error: Unexpected product response")
      ).toBeInTheDocument();
    });
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
