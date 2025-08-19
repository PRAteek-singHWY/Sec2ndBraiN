import type { ReactElement } from "react";

type variants = "primary" | "secondary";
type sizes = "sm" | "md" | "lg";

export interface ButtonProps {
  variant: variants;
  size: sizes;
  text: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  onClick?: () => void;
  widthFull?: boolean;
  loading?: boolean;
}

// now this object will have keys of type varianst with values as strings
const variantStyles: Record<variants, string> = {
  primary: "bg-purple-600 text-purple-300",
  secondary: "bg-purple-300 text-purple-600",
};

const sizeStyles: Record<sizes, string> = {
  sm: "py-1 px-2 text-sm rounded-sm",
  md: "py-2 px-4 text-md rounded-md",
  lg: "py-4 px-8 text-xl rounded-xl",
};

const defaultStyles =
  "px-4 py-2 rounded-md font-light p-4 flex items-center justify-center  gap-2";

export const Button = ({
  variant,
  text,
  size,
  startIcon,
  onClick,
  widthFull,
  loading,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${variantStyles[variant]} ${defaultStyles} ${
        sizeStyles[size]
      } ${widthFull ? "w-full" : ""} ${loading ? "opacity-35" : ""} ${
        !loading ? "cursor-pointer" : ""
      }`}
    >
      {startIcon}
      {text}

      {/* {props.endIcon && props.endIcon} */}
    </button>
  );
};
