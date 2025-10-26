import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useProductDetails } from "../../context/ProductDetailsContext";
import { useCart } from "../../context/CartContext";
import Button from "../../components/Button/Button";
import ProductDetailsTable from "../../components/ProductDetailsTable/ProductDetailsTable";
import clsx from "clsx";
import Styles from "./product-details.module.scss";

const ProductDetailsPage = () => {
  const { product, loading, error, fetchProductDetails } = useProductDetails();
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<number | null>(null);
  const { id } = useParams();
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchProductDetails(id);
    }
  }, [id, fetchProductDetails]);
  if (loading) return <section>Loading...</section>;
  if (!product) return <section>Product not found</section>;
  if (error) return <section>Error: {error}</section>;

  const handleAddToCart = () => {
    if (selectedColor && selectedStorage) {
      addToCart(product, selectedColor, selectedStorage, product.price);
    }
  };

  return (
    <section className={Styles.ProductDetailsPage}>
      <img
        src={product.imgUrl}
        alt={product.brand}
        width={330}
        height={330}
        className={Styles.ProductDetailsPage__image}
      />

      <div>
        <ProductDetailsTable product={product} />
        <div className={Styles.ProductDetailsPage__options}>
          <p>How much space do you need?</p>
          <ul className={Styles.ProductDetailsPage__options__list}>
            {product.options.storages.map(
              ({ name: storageName, code: storageCode }) => (
                <li key={storageCode}>
                  <button
                    className={clsx(
                      Styles.ProductDetailsPage__options__list__btn,
                      {
                        [Styles[
                          "ProductDetailsPage__options__list__btn--active"
                        ]]: selectedStorage === storageCode,
                      }
                    )}
                    onClick={() => setSelectedStorage(storageCode)}
                  >
                    {storageName}
                  </button>
                </li>
              )
            )}
          </ul>
          <p>Pick your favorite color</p>
          <ul className={Styles.ProductDetailsPage__options__list}>
            {product.options.colors.map(
              ({ code: colorCode, name: colorName }) => (
                <li key={colorCode}>
                  <button
                    className={clsx(
                      Styles.ProductDetailsPage__options__list__btn,
                      {
                        [Styles[
                          "ProductDetailsPage__options__list__btn--active"
                        ]]: selectedColor === colorCode,
                      }
                    )}
                    onClick={() => setSelectedColor(colorCode)}
                  >
                    {colorName}
                  </button>
                </li>
              )
            )}
          </ul>
          <h2>
            {Number(product.price).toLocaleString("en-US", {
              style: "currency",
              currency: "EUR",
            })}
          </h2>
          <Link to='/cart'>
            <Button
              onClick={handleAddToCart}
              disabled={!selectedColor || !selectedStorage}
            >
              Add
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsPage;
