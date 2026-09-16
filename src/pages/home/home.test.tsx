import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ProductProvider } from "../../context/ProductContext";
import HomePage from "./home";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

const mockProducts = [
  {
    id: "1",
    brand: "Apple",
    model: "iPhone 14",
    price: "999",
    imgUrl: "/image1.jpg",
  },
  {
    id: "2",
    brand: "Samsung",
    model: "Galaxy S23",
    price: "899",
    imgUrl: "/image2.jpg",
  },
];

const renderHomePage = (searchTerm = "") => {
  return render(
    <MemoryRouter>
      <ProductProvider>
        <HomePage searchTerm={searchTerm} />
      </ProductProvider>
    </MemoryRouter>
  );
};

describe("HomePage", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
    globalThis.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows a loading state while fetching products", () => {
    vi.mocked(globalThis.fetch).mockReturnValue(new Promise(() => {}));

    renderHomePage();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an error state when fetching fails", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it("shows an empty state when there are no products", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText("No products found.")).toBeInTheDocument();
    });
  });

  it("renders the list of products", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    } as Response);

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText("iPhone 14")).toBeInTheDocument();
    });
    expect(screen.getByText("Galaxy S23")).toBeInTheDocument();
  });

  it("links each product to its details page", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    } as Response);

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText("iPhone 14")).toBeInTheDocument();
    });

    const links = screen.getAllByRole("link");
    expect(links.find((link) => link.getAttribute("href") === "/details/1")).toBeTruthy();
  });

  it("filters products by the search term", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    } as Response);

    renderHomePage("galaxy");

    await waitFor(() => {
      expect(screen.getByText("Galaxy S23")).toBeInTheDocument();
    });
    expect(screen.queryByText("iPhone 14")).not.toBeInTheDocument();
  });
});
