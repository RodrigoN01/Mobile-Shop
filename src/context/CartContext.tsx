import { createContext, useContext, useState, useEffect } from "react";
import type { ProductDetails, CartItem } from "../types";

type CartContextType = {
  cart: CartItem[];
  addToCart: (
    product: ProductDetails,
    color: number,
    storage: number,
    price: string
  ) => void;
  removeFromCart: (id: string, color: number, storage: number) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_EXPIRY_TIME = 60 * 60 * 1000;

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("cart");
    const timestamp = localStorage.getItem("cartTimestamp");

    if (stored && timestamp) {
      const now = Date.now();
      const elapsed = now - parseInt(timestamp);

      if (elapsed < CART_EXPIRY_TIME) {
        return JSON.parse(stored);
      } else {
        localStorage.removeItem("cart");
        localStorage.removeItem("cartTimestamp");
      }
    }
    return [];
  });

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.setItem("cartTimestamp", Date.now().toString());
    } else {
      localStorage.removeItem("cart");
      localStorage.removeItem("cartTimestamp");
    }
  }, [cart]);

  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = localStorage.getItem("cartTimestamp");

      if (timestamp) {
        const now = Date.now();
        const elapsed = now - parseInt(timestamp);

        if (elapsed >= CART_EXPIRY_TIME) {
          setCart([]);
          localStorage.removeItem("cart");
          localStorage.removeItem("cartTimestamp");
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const addToCart = async (
    product: ProductDetails,
    color: number,
    storage: number,
    price: string
  ) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) =>
          item.id === product.id &&
          item.selectedColor === color &&
          item.selectedStorage === storage &&
          item.price === price
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item === existingItem
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
          selectedColor: color,
          selectedStorage: storage,
          price: price,
        },
      ];
    });

    try {
      await fetch("https://itx-frontend-test.onrender.com/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: product.id,
          colorCode: color,
          storageCode: storage,
        }),
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const removeFromCart = (id: string, color: number, storage: number) => {
    setCart((prevCart) => {
      const itemToRemove = prevCart.find(
        (item) =>
          item.id === id &&
          item.selectedColor === color &&
          item.selectedStorage === storage
      );

      if (!itemToRemove) return prevCart;

      if (itemToRemove.quantity > 1) {
        return prevCart.map((item) =>
          item === itemToRemove
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }

      return prevCart.filter((item) => item !== itemToRemove);
    });
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0
    );
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
