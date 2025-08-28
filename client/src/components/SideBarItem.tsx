import { ReactElement } from "react";

interface SideBarItemProps {
  text: string;
  icon: ReactElement;
}

export const SideBarItem = ({ text, icon }: SideBarItemProps) => {
  return (
    <div className="flex text-gray-900 py-2 px-4 cursor-pointer hover:bg-blue-200 rounded-4xl w-55">
      <div className="pr-2">{icon}</div>
      <div>{text}</div>
    </div>
  );
};
