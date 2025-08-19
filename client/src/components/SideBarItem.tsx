import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

interface SideBarItemProps {
  text: ReactElement;
  icon: ReactElement;
  route?: string;
}

export const SideBarItem = ({ text, icon, route }: SideBarItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex text-gray-900 py-2 px-4 cursor-pointer hover:bg-blue-200 rounded-4xl w-55"
    >
      <div className="pr-2">{icon}</div>
      <div>{text}</div>
    </div>
  );
};
