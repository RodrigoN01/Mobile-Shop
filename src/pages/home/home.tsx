import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import ProductCard from "../../components/ProductCard/ProductCard";
import { useProducts } from "../../context/ProductContext";
import Styles from "./home.module.scss";

const ITEMS_PER_PAGE = 8;

const HomePage = ({ searchTerm }: { searchTerm: string }) => {
  const { products, loading, error } = useProducts();
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef(null);

  const filteredProducts = products.filter(
    (product) =>
      product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && visibleItems < products.length) {
        setVisibleItems((prev) => prev + ITEMS_PER_PAGE);
      }
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [visibleItems, products.length]);

  if (loading) return <section>Loading...</section>;
  if (error) return <section>Error: {error}</section>;
  if (!products || products.length === 0) {
    return <section>No products found.</section>;
  }

  return (
    <section>
      <ul className={Styles.HomePage}>
        {filteredProducts.slice(0, visibleItems).map((product) => (
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
      <div ref={loaderRef} style={{ height: "20px" }} />
    </section>
  );
};

export default HomePage;
