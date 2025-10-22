import { Link } from "react-router";
import { FaChevronLeft } from "react-icons/fa";
import Styles from "./BackButton.module.scss";

const BackButton = () => {
  return (
    <div className={Styles.BackButton}>
      <Link to='/' className={Styles.BackButton__inner}>
        <FaChevronLeft size={16} /> <span>Back</span>
      </Link>
    </div>
  );
};

export default BackButton;
