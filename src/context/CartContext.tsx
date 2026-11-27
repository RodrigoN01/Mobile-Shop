import { createContext, use, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { ProductDetails, CartItem } from "../types";
import { isProductDetails, parsePrice, postCartItem } from "../api";

type CartContextType = {
  cart: CartItem[];
  addToCart: (
    product: ProductDetails,
    color: number,
    storage: number,
    price: string,
  ) => Promise<void>;
  removeFromCart: (id: string, color: number, storage: number) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "cart";
const CART_TIMESTAMP_KEY = "cartTimestamp";
const CART_EXPIRY_TIME = 60 * 60 * 1000;
const MAX_QUANTITY = 99;

const isCartItem = (value: unknown): value is CartItem => {
  if (!isProductDetails(value)) return false;
  const { quantity, selectedColor, selectedStorage } = value as Partial<CartItem>;
  return (
    Number.isInteger(quantity) &&
    quantity! > 0 &&
    quantity! <= MAX_QUANTITY &&
    typeof selectedColor === "number" &&
    typeof selectedStorage === "number"
  );
};

const clearStoredCart = () => {
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(CART_TIMESTAMP_KEY);
};

const isExpired = (timestamp: string | null) => {
  const savedAt = Number(timestamp);
  return !Number.isFinite(savedAt) || Date.now() - savedAt >= CART_EXPIRY_TIME;
};

/**
 * Reads the persisted cart. localStorage is user-controlled input: anything
 * malformed, expired or tampered with is discarded instead of crashing the app.
 */
const readStoredCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored || isExpired(localStorage.getItem(CART_TIMESTAMP_KEY))) {
      clearStoredCart();
      return [];
    }
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    clearStoredCart();
    return [];
  }
};

const isSameVariant = (
  item: CartItem,
  id: string,
  color: number,
  storage: number,
) =>
  item.id === id &&
  item.selectedColor === color &&
  item.selectedStorage === storage;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(readStoredCart);

  useEffect(() => {
    if (cart.length === 0) {
      clearStoredCart();
      return;
    }
    const serialized = JSON.stringify(cart);
    // Skip identical writes (e.g. after syncing from another tab) so tabs don't
    // ping-pong storage events back and forth.
    if (localStorage.getItem(CART_KEY) === serialized) return;
    localStorage.setItem(CART_KEY, serialized);
    localStorage.setItem(CART_TIMESTAMP_KEY, Date.now().toString());
  }, [cart]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        localStorage.getItem(CART_TIMESTAMP_KEY) &&
        isExpired(localStorage.getItem(CART_TIMESTAMP_KEY))
      ) {
        clearStoredCart();
        setCart([]);
      }
    }, 60_000);

    // Keep the cart in sync across open tabs.
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY || e.key === null) setCart(readStoredCart());
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const addToCart = async (
    product: ProductDetails,
    color: number,
    storage: number,
    price: string,
  ) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) =>
        isSameVariant(item, product.id, color, storage),
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item === existingItem
            ? { ...item, price, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
            : item,
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
          selectedColor: color,
          selectedStorage: storage,
          price,
        },
      ];
    });

    // Best-effort sync: the local cart is the source of truth.
    try {
      await postCartItem({
        id: product.id,
        colorCode: color,
        storageCode: storage,
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const removeFromCart = (id: string, color: number, storage: number) => {
    setCart((prevCart) => {
      const itemToRemove = prevCart.find((item) =>
        isSameVariant(item, id, color, storage),
      );

      if (!itemToRemove) return prevCart;

      if (itemToRemove.quantity > 1) {
        return prevCart.map((item) =>
          item === itemToRemove
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        );
      }

      return prevCart.filter((item) => item !== itemToRemove);
    });
  };

  const getCartTotal = () =>
    cart.reduce(
      (total, item) => total + (parsePrice(item.price) ?? 0) * item.quantity,
      0,
    );

  const getCartCount = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext
      value={{
        cart,
        addToCart,
        removeFromCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = use(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
