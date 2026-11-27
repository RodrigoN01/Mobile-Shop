import type { Product, ProductDetails } from "./types";

export const API_BASE_URL = "https://itx-frontend-test.onrender.com/api";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isOptionList = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.every(
    (o) => isRecord(o) && typeof o.code === "number" && typeof o.name === "string",
  );

// Lightweight runtime guards: the API is a third party we don't control, so we
// verify the fields the UI depends on instead of trusting an `as` cast.
export const isProduct = (value: unknown): value is Product =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.brand === "string" &&
  typeof value.model === "string" &&
  typeof value.price === "string" &&
  typeof value.imgUrl === "string";

export const isProductDetails = (value: unknown): value is ProductDetails => {
  if (!isRecord(value) || !isProduct(value)) return false;
  const { options } = value as Record<string, unknown>;
  return (
    isRecord(options) &&
    isOptionList(options.colors) &&
    isOptionList(options.storages)
  );
};

/** Parses an API price string; returns null for missing/invalid prices. */
export const parsePrice = (price: string): number | null => {
  if (price.trim() === "") return null;
  const n = Number(price);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
});

export const formatPrice = (amount: number): string =>
  currencyFormatter.format(amount);

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/product`, { signal });
  if (!res.ok) throw new Error("❌ Failed to fetch products");

  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error("Unexpected product list response");
  return data.filter(isProduct);
}

export async function fetchProductDetails(
  id: string,
  signal?: AbortSignal,
): Promise<ProductDetails> {
  // `id` comes from the URL — encode it so it can't alter the request path.
  const res = await fetch(`${API_BASE_URL}/product/${encodeURIComponent(id)}`, {
    signal,
  });
  if (!res.ok) throw new Error("❌ Failed to fetch product details");

  const data: unknown = await res.json();
  if (!isProductDetails(data)) throw new Error("Unexpected product response");
  return data;
}

export async function postCartItem(item: {
  id: string;
  colorCode: number;
  storageCode: number;
}): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error(`Cart sync failed with status ${res.status}`);
}
