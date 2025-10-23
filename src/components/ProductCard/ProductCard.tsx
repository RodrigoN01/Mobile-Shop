import Styles from "./ProductCard.module.scss";
import type { Product } from "../../types";

type ProductCardProps = Omit<Product, "id">;

const ProductCard = ({ model, price, imgUrl, brand }: ProductCardProps) => {
  return (
    <li className={Styles.ProductCard}>
      <img
        className={Styles.ProductCard__image}
        src={imgUrl}
        alt={model}
        width={220}
        height={220}
      />
      <p className={Styles.ProductCard__brand}>{brand}</p>
      <div className={Styles.ProductCard__info}>
        <p>{model}</p>
        {price && (
          <p>
            {Number(price).toLocaleString("en-US", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        )}
      </div>
    </li>
  );
};
export default ProductCard;
