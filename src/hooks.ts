import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

type UseInfiniteScrollResult = {
  visibleItems: number;
  loaderRef: RefObject<HTMLDivElement | null>;
};

export const useInfiniteScroll = (
  totalItems: number,
  itemsPerPage: number,
): UseInfiniteScrollResult => {
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && visibleItems < totalItems) {
          setVisibleItems((prev) => Math.min(prev + itemsPerPage, totalItems));
        }
      },
      { rootMargin: "100px" }, // Load before reaching bottom
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [visibleItems, totalItems, itemsPerPage]);

  // Reset visible items when total changes (e.g., after filtering)
  useEffect(() => {
    setVisibleItems(itemsPerPage);
  }, [totalItems, itemsPerPage]);

  return { visibleItems, loaderRef };
};
