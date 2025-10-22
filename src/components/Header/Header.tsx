import { useLocation, Link } from "react-router";
import { FaMobileAlt } from "react-icons/fa";
import { RiShoppingBag4Fill, RiShoppingBagLine } from "react-icons/ri";
import Styles from "./Header.module.scss";

const Header = () => {
  const { pathname } = useLocation();
  const cartCount = 2; // Example cart count

  return (
    <nav className={Styles.Header}>
      <Link to='/'>
        <div className={Styles.Header__logo}>
          <FaMobileAlt size={20} />
          <p className={Styles.Header__logo__text}>Mobile Shop</p>
        </div>
      </Link>
      {pathname !== "/cart" && (
        <Link to='/cart' className={Styles.Header__cart}>
          {cartCount > 0 ? (
            <RiShoppingBag4Fill size={20} />
          ) : (
            <RiShoppingBagLine size={20} />
          )}
          {cartCount > 0 && (
            <span className={Styles.Header__cart__count}>{cartCount}</span>
          )}
        </Link>
      )}
    </nav>
  );
};

export default Header;
