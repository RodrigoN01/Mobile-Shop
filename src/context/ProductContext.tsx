import { createContext, useState, useEffect, useContext } from "react";
import type { Product } from "../types";

type ProductContextType = {
  products: Product[];
  loading: boolean;
  error: string | null;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "https://itx-frontend-test.onrender.com/api/product"
        );

        if (!res.ok) throw new Error("❌ Failed to fetch products");

        const data = await res.json();

        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts(): ProductContextType {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
