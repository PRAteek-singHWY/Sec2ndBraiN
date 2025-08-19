import { CrossIcon } from "../assets/icons/CrossIcon";
import { Logo } from "../assets/icons/Logo";
import { TwitterIcon } from "../assets/icons/TwitterIcon";
import { YoutubeIcon } from "../assets/icons/YoutubeIcon";
import { SideBarItem } from "./SideBarItem";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideBar = ({ onClose, isOpen }: SideBarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  if (!isOpen) return null;

  const initials =
    user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="h-screen bg-purple-300 border-r w-76 fixed left-0 top-0 flex flex-col justify-between">
      <div>
        {/* Close Button */}
        <div
          onClick={onClose}
          className="cursor-pointer text-purple-600 hover:text-gray-400 flex justify-end pt-1 pr-1"
        >
          <CrossIcon size="lg" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-start p-4 gap-3">
          <Logo />
          <div className="text-2xl font-extrabold font-mono text-purple-600">
            Brainly
          </div>
        </div>

        {/* Profile Avatar Only */}
        <div
          className="pt-6 pb-4 flex justify-center cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out"
          onClick={() => navigate("/profile")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/profile");
          }}
        >
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border-2 border-purple-600 shadow-md"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
              {initials}
            </div>
          )}
        </div>

        {/* Other Menu Items */}
        <div className="pt-3 flex flex-col gap-1 pl-10">
          <SideBarItem icon={<YoutubeIcon />} text="Youtube" route="/youtube" />
          <SideBarItem icon={<TwitterIcon />} text="Twitter" route="/twitter" />
        </div>
      </div>

      {/* Logout */}
      <div className="flex justify-center m-4">
        <button
          onClick={handleLogout}
          className="w-30 py-2 px-4 rounded-lg font-bold border-2 text-sm bg-red-600 border-red-600 text-white hover:bg-white hover:text-red-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
