import { IconProps, iconSizingVariants } from ".";

export const PlusIcon = (props: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5" // <-- Fixed
      stroke="currentColor"
      className={`${iconSizingVariants[props.size]}`}
    >
      <path
        strokeLinecap="round" // <-- Fixed
        strokeLinejoin="round" // <-- Fixed
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
};