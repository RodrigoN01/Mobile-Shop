import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { ProductDetailsProvider } from "../../context/ProductDetailsContext";
import { CartProvider } from "../../context/CartContext";
import ProductDetailsPage from "./product-details";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";

const mockProductDetails = {
  id: "1",
  brand: "Apple",
  model: "iPhone 14",
  price: "999",
  imgUrl: "/image1.jpg",
  cpu: "A15",
  ram: "6GB",
  os: "iOS",
  displayResolution: "1170x2532",
  battery: "3279mAh",
  primaryCamera: ["12MP"],
  secondaryCmera: ["12MP"],
  dimentions: "146.7x71.5x7.8mm",
  weight: "172g",
  options: {
    colors: [{ code: 1, name: "Black" }],
    storages: [{ code: 128, name: "128GB" }],
  },
};

const renderProductDetailsPage = (id = "1") => {
  return render(
    <MemoryRouter initialEntries={[`/details/${id}`]}>
      <CartProvider>
        <ProductDetailsProvider>
          <Routes>
            <Route path="/details/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<div>Cart</div>} />
          </Routes>
        </ProductDetailsProvider>
      </CartProvider>
    </MemoryRouter>
  );
};

describe("ProductDetailsPage", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("shows a loading state while fetching the product", () => {
    vi.mocked(globalThis.fetch).mockReturnValue(new Promise(() => {}));

    renderProductDetailsPage();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an error state when fetching fails", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    renderProductDetailsPage();

    await waitFor(() => {
      expect(
        screen.getByText("Error: ❌ Failed to fetch product details")
      ).toBeInTheDocument();
    });
  });

  it("renders the product details and options once loaded", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProductDetails,
    } as Response);

    renderProductDetailsPage();

    await waitFor(() => {
      expect(screen.getByText("128GB")).toBeInTheDocument();
    });
    expect(screen.getByText("Black")).toBeInTheDocument();
    expect(screen.getByText("€999.00")).toBeInTheDocument();
  });

  it("disables the Add button until a color and storage are selected", async () => {
    const user = userEvent.setup();
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProductDetails,
    } as Response);

    renderProductDetailsPage();

    await waitFor(() => {
      expect(screen.getByText("128GB")).toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", { name: "Add" });
    expect(addButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "128GB" }));
    expect(addButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Black" }));
    expect(addButton).toBeEnabled();
  });

  it("adds the selected variant to the cart when Add is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductDetails,
      } as Response)
      .mockResolvedValueOnce({ ok: true } as Response);

    renderProductDetailsPage();

    await waitFor(() => {
      expect(screen.getByText("128GB")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "128GB" }));
    await user.click(screen.getByRole("button", { name: "Black" }));
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://itx-frontend-test.onrender.com/api/cart",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("lets a product without a price be added once both options are picked", async () => {
    const user = userEvent.setup();
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockProductDetails, price: "" }),
    } as Response);

    renderProductDetailsPage();

    await waitFor(() => {
      expect(screen.getByText("Price unavailable")).toBeInTheDocument();
    });
    const addButton = screen.getByRole("button", { name: "Add" });
    expect(addButton).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "128GB" }));
    expect(addButton).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Black" }));
    expect(addButton).toBeEnabled();
  });

  it("navigates to the cart after adding", async () => {
    const user = userEvent.setup();
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductDetails,
      } as Response)
      .mockResolvedValueOnce({ ok: true } as Response);

    renderProductDetailsPage();

    await waitFor(() => {
      expect(screen.getByText("128GB")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: "128GB" }));
    await user.click(screen.getByRole("button", { name: "Black" }));
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Cart")).toBeInTheDocument();
  });
});
