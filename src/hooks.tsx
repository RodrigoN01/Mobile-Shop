import { useEffect, useRef, useState } from "react";

export const useInfiniteScroll = (totalItems: number, itemsPerPage: number) => {
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
      { rootMargin: "100px" } // Load before reaching bottom
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
