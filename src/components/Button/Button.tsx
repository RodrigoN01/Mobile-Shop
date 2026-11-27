import clsx from "clsx";
import Styles from "./Button.module.scss";

type ButtonProps = {
  onClick?: () => void;
  variant?: "outline";
  disabled?: boolean;
  children: string;
};

const Button = ({ onClick, variant, disabled, children }: ButtonProps) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className={clsx(
        Styles.Button,
        variant === "outline" && Styles["Button--outline"],
        disabled && Styles["Button--disabled"],
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
