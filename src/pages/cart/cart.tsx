import { useCart } from "../../context/CartContext";
import { Link } from "react-router";
import Button from "../../components/Button/Button";
import { FaRegTrashAlt } from "react-icons/fa";
import Styles from "./cart.module.scss";

const CartPage = () => {
  const { cart, getCartCount, removeFromCart, getCartTotal } = useCart();
  const cartCount = getCartCount();

  const generateCartItemKey = (
    id: string,
    color: number,
    storage: number
  ): string => {
    return `${id}-${color}-${storage}`;
  };

  if (cart.length === 0) {
    return (
      <section className={Styles.CartPage}>
        <h2>Cart ({cartCount})</h2>
        <div className={Styles.CartPage__content}>
          <Link to='/'>
            <Button variant='outline'>Continue Shopping</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={Styles.CartPage}>
      <h2>Cart ({cartCount})</h2>
      <ul>
        {cart.map((item) => (
          <li
            key={generateCartItemKey(
              item.id,
              item.selectedColor,
              item.selectedStorage
            )}
            className={Styles.CartPage__item}
          >
            <div className={Styles.CartPage__item__image}>
              <Link to={`/details/${item.id}`}>
                <img
                  src={item.imgUrl}
                  alt={item.brand}
                  width={80}
                  height={80}
                />
              </Link>
            </div>
            <div className={Styles.CartPage__item__info}>
              <h4>{item.brand}</h4>
              <p>{item.model}</p>
              <p>
                {
                  item.options.colors.find(
                    (color) => color.code === item.selectedColor
                  )?.name
                }
              </p>
              <p>
                {
                  item.options.storages.find(
                    (storage) => storage.code === item.selectedStorage
                  )?.name
                }
              </p>
            </div>
            <div className={Styles.CartPage__item__price}>
              <p>
                {(Number(item.price) * item.quantity).toLocaleString("en-US", {
                  style: "currency",
                  currency: "EUR",
                })}
                {item.quantity > 1 && (
                  <span className={Styles.CartPage__item__price__quantity}>
                    ({item.quantity})
                  </span>
                )}
              </p>
              <button
                onClick={() =>
                  removeFromCart(
                    item.id,
                    item.selectedColor,
                    item.selectedStorage
                  )
                }
                className={Styles.CartPage__item__removeBtn}
              >
                <FaRegTrashAlt />
                <span>Remove</span>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className={Styles.CartPage__content}>
        <h3>
          <span>Total: </span>
          {Number(getCartTotal().toFixed(2)).toLocaleString("en-US", {
            style: "currency",
            currency: "EUR",
          })}
        </h3>
        <Link to='/checkout'>
          <Button>Pay</Button>
        </Link>
      </div>
    </section>
  );
};

export default CartPage;
