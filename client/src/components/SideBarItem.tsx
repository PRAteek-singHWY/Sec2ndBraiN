import { ReactElement } from "react";

interface SideBarItemProps {
  text: string;
  icon: ReactElement;
}

export const SideBarItem = ({ text, icon }: SideBarItemProps) => {
  return (
    // Updated hover:bg-purple-200 to match your theme
    <div className="flex text-gray-900 py-2 px-4 cursor-pointer hover:bg-purple-200 rounded-lg w-full">
      <div className="pr-2">{icon}</div>
      <div>{text}</div>
    </div>
  );
};