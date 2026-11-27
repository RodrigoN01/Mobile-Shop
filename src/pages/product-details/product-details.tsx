import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useProductDetails } from "../../context/ProductDetailsContext";
import { useCart } from "../../context/CartContext";
import Button from "../../components/Button/Button";
import ProductDetailsTable from "../../components/ProductDetailsTable/ProductDetailsTable";
import { formatPrice, parsePrice } from "../../api";
import type { ProductDetails } from "../../types";
import clsx from "clsx";
import Styles from "./product-details.module.scss";

type OptionPickerProps = {
  label: string;
  options: { code: number; name: string }[];
  selected: number | null;
  onSelect: (code: number) => void;
};

const OptionPicker = ({ label, options, selected, onSelect }: OptionPickerProps) => (
  <>
    <p>{label}</p>
    <ul className={Styles.ProductDetailsPage__options__list}>
      {options.map(({ code, name }) => (
        <li key={code}>
          <button
            type='button'
            aria-pressed={selected === code}
            className={clsx(
              Styles.ProductDetailsPage__options__list__btn,
              selected === code &&
                Styles["ProductDetailsPage__options__list__btn--active"],
            )}
            onClick={() => onSelect(code)}
          >
            {name}
          </button>
        </li>
      ))}
    </ul>
  </>
);

const ProductDetailsView = ({ product }: { product: ProductDetails }) => {
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<number | null>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const price = parsePrice(product.price);
  // Add is enabled once both a storage and a color have been picked.
  const canAdd = selectedColor !== null && selectedStorage !== null;

  const handleAddToCart = () => {
    if (!canAdd) return;
    void addToCart(product, selectedColor, selectedStorage, product.price);
    navigate("/cart");
  };

  return (
    <section className={Styles.ProductDetailsPage}>
      <title>{`${product.brand} ${product.model} | Mobile Shop`}</title>
      <img
        src={product.imgUrl}
        alt={`${product.brand} ${product.model}`}
        width={330}
        height={330}
        fetchPriority='high'
        className={Styles.ProductDetailsPage__image}
      />

      <div>
        <ProductDetailsTable product={product} />
        <div className={Styles.ProductDetailsPage__options}>
          <OptionPicker
            label='How much space do you need?'
            options={product.options.storages}
            selected={selectedStorage}
            onSelect={setSelectedStorage}
          />
          <OptionPicker
            label='Pick your favorite color'
            options={product.options.colors}
            selected={selectedColor}
            onSelect={setSelectedColor}
          />
          <h2>{price !== null ? formatPrice(price) : "Price unavailable"}</h2>
          <Button onClick={handleAddToCart} disabled={!canAdd}>
            Add
          </Button>
        </div>
      </div>
    </section>
  );
};

const ProductDetailsPage = () => {
  const { product, loading, error, fetchProductDetails } = useProductDetails();
  const { id } = useParams();

  useEffect(() => {
    if (id) void fetchProductDetails(id);
  }, [id, fetchProductDetails]);

  if (error) return <section>Error: {error}</section>;
  if (loading) return <section>Loading...</section>;
  if (!id) return <section>Product not found</section>;
  // Until the effect runs, the context may still hold the previous product.
  if (product?.id !== id) return <section>Loading...</section>;

  // Keyed by id so selections reset when navigating between products.
  return <ProductDetailsView key={product.id} product={product} />;
};

export default ProductDetailsPage;
