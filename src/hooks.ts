import { useCallback, useState } from "react";

type UseInfiniteScrollResult = {
  visibleItems: number;
  /** Callback ref for the sentinel element placed after the list. */
  loaderRef: (node: HTMLElement | null) => (() => void) | undefined;
};

export const useInfiniteScroll = (
  totalItems: number,
  itemsPerPage: number,
): UseInfiniteScrollResult => {
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const [prevTotal, setPrevTotal] = useState(totalItems);

  // Reset when the list changes (e.g. after filtering). Adjusting state during
  // render avoids the extra commit an effect-based reset would cause.
  if (prevTotal !== totalItems) {
    setPrevTotal(totalItems);
    setVisibleItems(itemsPerPage);
  }

  // React 19 ref callbacks can return a cleanup function. `visibleItems` is a
  // dependency so the observer is re-attached after each page loads; that
  // re-checks the sentinel in case it is still on screen (tall viewports).
  const loaderRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return undefined;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting && visibleItems < totalItems) {
            setVisibleItems((prev) =>
              Math.min(prev + itemsPerPage, totalItems),
            );
          }
        },
        { rootMargin: "200px" }, // Load before reaching the bottom
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [visibleItems, totalItems, itemsPerPage],
  );

  return { visibleItems, loaderRef };
};
