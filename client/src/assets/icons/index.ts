type sizing = "sm" | "md" | "lg";
export interface IconProps {
  size: sizing;
}
export const iconSizingVariants: Record<sizing, string> = {
  sm: "size-2",
  md: "size-4",
  lg: "size-6",
};
