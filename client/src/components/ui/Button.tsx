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

const defaultStyles = "rounded-md p-4";
export const Button = (props: ButtonProps) => {
  return (
    <button
      className={`${variantStyles[props.variant]} ${defaultStyles} ${
        sizeStyles[props.size]
      } `}
    >
      <div className="flex">
        {props.startIcon && props.startIcon}
        <div className="pl-2 pr-2">{props.text}</div>

        {props.endIcon && props.endIcon}
      </div>
    </button>
  );
};
