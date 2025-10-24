import { IconProps, iconSizingVariants } from ".";

export const HamIcon = (props: IconProps) => {
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
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
};