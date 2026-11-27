import { createContext, use, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "../types";
import { fetchProducts } from "../api";

type ProductContextType = {
  products: Product[];
  loading: boolean;
  error: string | null;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchProducts(controller.signal)
      .then(setProducts)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "An error occurred");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <ProductContext value={{ products, loading, error }}>
      {children}
    </ProductContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProducts(): ProductContextType {
  const context = use(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
