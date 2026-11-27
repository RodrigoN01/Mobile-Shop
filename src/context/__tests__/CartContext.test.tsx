import { renderHook, act, cleanup, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "../CartContext";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe("CartContext", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("starts with an empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.getCartCount()).toBe(0);
    expect(result.current.getCartTotal()).toBe(0);
  });

  it("adds a new item to the cart", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addToCart(mockProduct, 1, 128, "999");
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0]).toMatchObject({
      id: "1",
      quantity: 1,
      selectedColor: 1,
      selectedStorage: 128,
    });
  });

  it("increments quantity when the same variant is added again", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addToCart(mockProduct, 1, 128, "999");
    });
    await act(async () => {
      await result.current.addToCart(mockProduct, 1, 128, "999");
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0]?.quantity).toBe(2);
  });

  it("treats different color/storage combinations as separate items", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addToCart(mockProduct, 1, 128, "999");
    });
    await act(async () => {
      await result.current.addToCart(mockProduct, 2, 256, "999");
    });

    expect(result.current.cart).toHaveLength(2);
  });

  it("posts the added item to the cart API", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addToCart(mockProduct, 1, 128, "999");
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://itx-frontend-test.onrender.com/api/cart",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("does not throw when the cart API call fails", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addToCart(mockProduct, 1, 128, "999");
    });

    expect(result.current.cart).toHaveLength(1);
  });

  it("decrements quantity when removing one of multiple items", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addToCart(mockProduct, 1, 128, "999");
    });
    await act(async () => {
      await result.current.addToCart(mockProduct, 1, 128, "999");
    });

    act(() => {
      result.current.removeFromCart("1", 1, 128);
    });

    expect(result.current.cart[0]?.quantity).toBe(1);
  });

  it("removes the item entirely when quantity reaches zero", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addToCart(mockProduct, 1, 128, "999");
    });

    act(() => {
      result.current.removeFromCart("1", 1, 128);
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it("computes the cart total across items", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addToCart(mockProduct, 1, 128, "999");
    });
    await act(async () => {
      await result.current.addToCart(mockProduct, 1, 128, "999");
    });

    expect(result.current.getCartTotal()).toBe(1998);
    expect(result.current.getCartCount()).toBe(2);
  });

  it("persists the cart to localStorage", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addToCart(mockProduct, 1, 128, "999");
    });

    await waitFor(() => {
      expect(localStorage.getItem("cart")).not.toBeNull();
    });
    expect(localStorage.getItem("cartTimestamp")).not.toBeNull();
  });

  it("loads an existing, non-expired cart from localStorage", () => {
    const storedItem = {
      ...mockProduct,
      quantity: 3,
      selectedColor: 1,
      selectedStorage: 128,
    };
    localStorage.setItem("cart", JSON.stringify([storedItem]));
    localStorage.setItem("cartTimestamp", Date.now().toString());

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.getCartCount()).toBe(3);
  });

  it("discards an expired cart from localStorage", () => {
    const storedItem = {
      ...mockProduct,
      quantity: 3,
      selectedColor: 1,
      selectedStorage: 128,
    };
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    localStorage.setItem("cart", JSON.stringify([storedItem]));
    localStorage.setItem("cartTimestamp", twoHoursAgo.toString());

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cart).toHaveLength(0);
    expect(localStorage.getItem("cart")).toBeNull();
  });

  it("recovers from malformed JSON in localStorage instead of crashing", () => {
    localStorage.setItem("cart", "{not json");
    localStorage.setItem("cartTimestamp", Date.now().toString());

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cart).toHaveLength(0);
    expect(localStorage.getItem("cart")).toBeNull();
  });

  it("drops tampered or malformed items from localStorage", () => {
    const valid = { ...mockProduct, quantity: 1, selectedColor: 1, selectedStorage: 128 };
    localStorage.setItem(
      "cart",
      JSON.stringify([
        valid,
        { ...valid, id: "2", quantity: -5 },
        { ...valid, id: "3", quantity: "lots" },
        { id: "4" },
        null,
      ])
    );
    localStorage.setItem("cartTimestamp", Date.now().toString());

    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0]?.id).toBe("1");
  });

  it("adds items without a price, counting them as 0 in the total", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.addToCart({ ...mockProduct, price: "" }, 1, 128, "");
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.getCartTotal()).toBe(0);
    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it("syncs the cart when another tab changes it", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const storedItem = { ...mockProduct, quantity: 2, selectedColor: 1, selectedStorage: 128 };

    act(() => {
      localStorage.setItem("cart", JSON.stringify([storedItem]));
      localStorage.setItem("cartTimestamp", Date.now().toString());
      window.dispatchEvent(new StorageEvent("storage", { key: "cart" }));
    });

    expect(result.current.getCartCount()).toBe(2);
  });

  it("throws when used outside of a CartProvider", () => {
    expect(() => renderHook(() => useCart())).toThrow(
      "useCart must be used within a CartProvider"
    );
  });
});
