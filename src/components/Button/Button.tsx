import clsx from "clsx";
import Styles from "./Button.module.scss";

type ButtonProps = {
  onClick?: () => void;
  variant?: string;
  disabled?: boolean;
  children: string;
};

const Button = ({ onClick, variant, disabled, children }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(Styles.Button, {
        [Styles["Button--outline"]]: variant === "outline",
        [Styles["Button--disabled"]]: disabled,
      })}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
