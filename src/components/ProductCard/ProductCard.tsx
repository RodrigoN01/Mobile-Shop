import Styles from "./ProductCard.module.scss";
import type { Product } from "../../types";
import { formatPrice, parsePrice } from "../../api";

type ProductCardProps = Omit<Product, "id"> & {
  /** Load the image eagerly with high priority (above-the-fold cards). */
  priority?: boolean;
};

const ProductCard = ({
  model,
  price,
  imgUrl,
  brand,
  priority = false,
}: ProductCardProps) => {
  const amount = parsePrice(price);

  return (
    <article className={Styles.ProductCard}>
      <img
        className={Styles.ProductCard__image}
        src={imgUrl}
        alt={model}
        width={220}
        height={220}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding='async'
      />
      <p className={Styles.ProductCard__brand}>{brand}</p>
      <div className={Styles.ProductCard__info}>
        <p>{model}</p>
        {amount !== null && <p>{formatPrice(amount)}</p>}
      </div>
    </article>
  );
};
export default ProductCard;
