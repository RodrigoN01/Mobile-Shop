import { render, screen, cleanup, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { CartProvider, useCart } from "../../context/CartContext";
import CartPage from "./cart";
import { describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import type { ProductDetails } from "../../types";

const mockProduct: ProductDetails = {
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
  announced: "2022",
  audioJack: "No",
  bluetooth: ["5.3"],
  chipset: "Apple A15",
  colors: ["Black"],
  displaySize: "6.1",
  displayType: "OLED",
  edge: "Yes",
  externalMemory: "No",
  gprs: "Yes",
  gps: "Yes",
  gpu: "Apple GPU",
  internalMemory: ["128GB"],
  networkSpeed: "5G",
  networkTechnology: "5G",
  nfc: "Yes",
  sim: "Nano-SIM",
  usb: "Lightning",
  wlan: ["Wi-Fi 6"],
  radio: "No",
  sensors: ["Face ID"],
  speaker: "Stereo",
  status: "Available",
};

describe("CartPage", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("should render the cart title with count", () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <CartPage />
        </CartProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/Cart \(\d+\)/)).toBeInTheDocument();
  });

  it("should display empty cart message when cart is empty", () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <CartPage />
        </CartProvider>
      </MemoryRouter>
    );
    expect(screen.getByText("Continue Shopping")).toBeInTheDocument();
  });

  it("should display cart items when products are added", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    result.current.addToCart(mockProduct, 1, 128, "999");

    render(
      <MemoryRouter>
        <CartProvider>
          <CartPage />
        </CartProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("iPhone 14")).toBeInTheDocument();
  });

  it("should remove item from cart when remove button is clicked", async () => {
    const user = userEvent.setup();

    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    result.current.addToCart(mockProduct, 1, 128, "999");

    render(
      <MemoryRouter>
        <CartProvider>
          <CartPage />
        </CartProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Cart (1)")).toBeInTheDocument();

    const removeButton = screen.getByRole("button", { name: /remove/i });
    await user.click(removeButton);

    expect(screen.getByText("Cart (0)")).toBeInTheDocument();
    expect(screen.getByText("Continue Shopping")).toBeInTheDocument();
  });
});
