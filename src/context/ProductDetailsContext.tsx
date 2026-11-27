import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { ProductDetails } from "../types";
import { fetchProductDetails as fetchProductDetailsApi } from "../api";

type ProductDetailsContextType = {
  product: ProductDetails | null;
  loading: boolean;
  error: string | null;
  fetchProductDetails: (id: string) => Promise<void>;
};

const ProductDetailsContext = createContext<
  ProductDetailsContextType | undefined
>(undefined);

export function ProductDetailsProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session-lifetime cache so revisiting a product is instant.
  const cacheRef = useRef(new Map<string, ProductDetails>());
  // Only the most recent request may update state; older ones are aborted.
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  // Kept as an explicit useCallback: consumers list it as an effect dependency,
  // and tests run without the React Compiler.
  const fetchProductDetails = useCallback(async (id: string) => {
    controllerRef.current?.abort();

    const cached = cacheRef.current.get(id);
    if (cached) {
      controllerRef.current = null;
      setProduct(cached);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setProduct(null);
    setError(null);
    setLoading(true);

    try {
      const data = await fetchProductDetailsApi(id, controller.signal);
      if (controller.signal.aborted) return;
      cacheRef.current.set(id, data);
      setProduct(data);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      if (controllerRef.current === controller) setLoading(false);
    }
  }, []);

  return (
    <ProductDetailsContext
      value={{ product, loading, error, fetchProductDetails }}
    >
      {children}
    </ProductDetailsContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProductDetails(): ProductDetailsContextType {
  const context = use(ProductDetailsContext);
  if (context === undefined) {
    throw new Error(
      "useProductDetails must be used within a ProductDetailsProvider",
    );
  }
  return context;
}
