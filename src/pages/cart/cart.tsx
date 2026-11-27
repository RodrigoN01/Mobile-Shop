import { Link, useNavigate } from "react-router";
import { FaRegTrashAlt } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import Button from "../../components/Button/Button";
import { formatPrice, parsePrice } from "../../api";
import Styles from "./cart.module.scss";

const CartPage = () => {
  const { cart, getCartCount, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const cartCount = getCartCount();

  if (cart.length === 0) {
    return (
      <section className={Styles.CartPage}>
        <title>Cart | Mobile Shop</title>
        <h2>Cart ({cartCount})</h2>
        <div className={Styles.CartPage__content}>
          <Button variant='outline' onClick={() => navigate("/")}>
            Continue Shopping
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={Styles.CartPage}>
      <title>{`Cart (${cartCount}) | Mobile Shop`}</title>
      <h2>Cart ({cartCount})</h2>
      <ul>
        {cart.map((item) => {
          const colorName = item.options.colors.find(
            (color) => color.code === item.selectedColor,
          )?.name;
          const storageName = item.options.storages.find(
            (storage) => storage.code === item.selectedStorage,
          )?.name;

          return (
            <li
              key={`${item.id}-${item.selectedColor}-${item.selectedStorage}`}
              className={Styles.CartPage__item}
            >
              <div className={Styles.CartPage__item__image}>
                <Link to={`/details/${encodeURIComponent(item.id)}`}>
                  <img
                    src={item.imgUrl}
                    alt={`${item.brand} ${item.model}`}
                    width={80}
                    height={80}
                    loading='lazy'
                    decoding='async'
                  />
                </Link>
              </div>
              <div className={Styles.CartPage__item__info}>
                <h4>{item.brand}</h4>
                <p>{item.model}</p>
                <p>{colorName}</p>
                <p>{storageName}</p>
              </div>
              <div className={Styles.CartPage__item__price}>
                <p>
                  {formatPrice((parsePrice(item.price) ?? 0) * item.quantity)}
                  {item.quantity > 1 && (
                    <span className={Styles.CartPage__item__price__quantity}>
                      ({item.quantity})
                    </span>
                  )}
                </p>
                <button
                  type='button'
                  onClick={() =>
                    removeFromCart(
                      item.id,
                      item.selectedColor,
                      item.selectedStorage,
                    )
                  }
                  className={Styles.CartPage__item__removeBtn}
                >
                  <FaRegTrashAlt aria-hidden='true' />
                  <span>Remove</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className={Styles.CartPage__content}>
        <h3>
          <span>Total: </span>
          {formatPrice(getCartTotal())}
        </h3>
        <Button onClick={() => navigate("/checkout")}>Pay</Button>
      </div>
    </section>
  );
};

export default CartPage;
