import { Link } from "react-router";
import { useProducts } from "../../context/ProductContext";
import { useInfiniteScroll } from "../../hooks";
import ProductCard from "../../components/ProductCard/ProductCard";
import Styles from "./home.module.scss";
import type { Product } from "../../types";
import { useMemo } from "react";

const ITEMS_PER_PAGE = 8;

const matchesSearchTerm = (product: Product, searchTerm: string): boolean => {
  if (!searchTerm) return true;

  const normalizedSearch = searchTerm.toLowerCase().trim();
  const searchableText = `${product.model} ${product.brand}`.toLowerCase();

  return searchableText.includes(normalizedSearch);
};

const HomePage = ({ searchTerm }: { searchTerm: string }) => {
  const { products, loading, error } = useProducts();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => matchesSearchTerm(product, searchTerm));
  }, [products, searchTerm]);

  const { visibleItems, loaderRef } = useInfiniteScroll(
    filteredProducts.length,
    ITEMS_PER_PAGE
  );

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleItems);
  }, [filteredProducts, visibleItems]);

  const hasMoreItems = visibleItems < filteredProducts.length;

  if (loading) return <section>Loading...</section>;
  if (error) return <section>Error: {error}</section>;
  if (!products || products.length === 0) {
    return <section>No products found.</section>;
  }

  return (
    <section>
      <ul className={Styles.HomePage}>
        {visibleProducts.map((product) => (
          <Link key={product.id} to={`/details/${product.id}`}>
            <ProductCard
              model={product.model}
              price={product.price}
              imgUrl={product.imgUrl}
              brand={product.brand}
            />
          </Link>
        ))}
      </ul>
      {hasMoreItems && <div ref={loaderRef} />}
    </section>
  );
};

export default HomePage;
