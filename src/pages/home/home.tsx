import { useDeferredValue } from "react";
import { Link } from "react-router";
import { useProducts } from "../../context/ProductContext";
import { useInfiniteScroll } from "../../hooks";
import ProductCard from "../../components/ProductCard/ProductCard";
import Styles from "./home.module.scss";
import type { Product } from "../../types";

const ITEMS_PER_PAGE = 8;
// Roughly the first row on desktop: load these images eagerly for LCP.
const PRIORITY_IMAGES = 4;

const matchesSearchTerm = (product: Product, normalizedSearch: string) =>
  !normalizedSearch ||
  `${product.model} ${product.brand}`.toLowerCase().includes(normalizedSearch);

const HomePage = ({ searchTerm }: { searchTerm: string }) => {
  const { products, loading, error } = useProducts();
  // Keeps typing responsive: the input updates immediately, the grid catches up.
  const deferredSearch = useDeferredValue(searchTerm);
  const normalizedSearch = deferredSearch.toLowerCase().trim();

  const filteredProducts = products.filter((product) =>
    matchesSearchTerm(product, normalizedSearch),
  );

  const { visibleItems, loaderRef } = useInfiniteScroll(
    filteredProducts.length,
    ITEMS_PER_PAGE,
  );

  const visibleProducts = filteredProducts.slice(0, visibleItems);
  const hasMoreItems = visibleItems < filteredProducts.length;

  if (loading) return <section>Loading...</section>;
  if (error) return <section>Error: {error}</section>;
  if (products.length === 0) {
    return <section>No products found.</section>;
  }

  return (
    <section>
      <ul className={Styles.HomePage}>
        {visibleProducts.map((product, index) => (
          <li key={product.id}>
            <Link to={`/details/${product.id}`} className={Styles.HomePage__link}>
              <ProductCard
                model={product.model}
                price={product.price}
                imgUrl={product.imgUrl}
                brand={product.brand}
                priority={index < PRIORITY_IMAGES}
              />
            </Link>
          </li>
        ))}
      </ul>
      {hasMoreItems && <div ref={loaderRef} aria-hidden='true' />}
    </section>
  );
};

export default HomePage;
