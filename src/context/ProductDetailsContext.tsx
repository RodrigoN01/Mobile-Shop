import { createContext, useState, useContext, useCallback } from "react";
import type { ProductDetails } from "../types";

type ProductDetailsContextType = {
  product: ProductDetails | null;
  loading: boolean;
  error: string | null;
  fetchProductDetails: (id: string) => Promise<void>;
};

const ProductDetailsContext = createContext<
  ProductDetailsContextType | undefined
>(undefined);

export function ProductDetailsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductDetails = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://itx-frontend-test.onrender.com/api/product/${id}`
      );

      if (!res.ok) throw new Error("❌ Failed to fetch product details");

      const data = await res.json();
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []); // Memoize the function

  return (
    <ProductDetailsContext.Provider
      value={{ product, loading, error, fetchProductDetails }}
    >
      {children}
    </ProductDetailsContext.Provider>
  );
}

export function useProductDetails(): ProductDetailsContextType {
  const context = useContext(ProductDetailsContext);
  if (context === undefined) {
    throw new Error(
      "useProductDetails must be used within a ProductDetailsProvider"
    );
  }
  return context;
}
