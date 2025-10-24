import { CrossIcon } from "../assets/icons/CrossIcon";
import { Logo } from "../assets/icons/Logo";
import { TwitterIcon } from "../assets/icons/TwitterIcon";
import { YoutubeIcon } from "../assets/icons/YoutubeIcon";
import { SideBarItem } from "./SideBarItem";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { NotesIcon } from "../assets/icons/NotesIcon";
import { DocIcon } from "../assets/icons/DocIcon";

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
  setFilter: (f: "all" | "youtube" | "twitter" | "notes") => void; // NEW
}

export const SideBar = ({ onClose, isOpen, setFilter }: SideBarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logout(); // <-- Wait for the server to clear the cookie
    navigate("/"); // <-- THEN navigate
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
            Sec2ndBrain
          </div>
        </div>
        {/* Profile Avatar Only
        <p>DEBUG initials: "{initials}"</p>
        <p>DEBUG user: {JSON.stringify(user)}</p> */}
        <div
          className="pt-6 pb-2 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out"
          onClick={() => navigate("/profile")}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-400 text-lg font-bold text-white overflow-hidden">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                className="w-full h-full object-cover"
                alt="profile"
              />
            ) : (
              (
                user?.name?.[0] ||
                user?.username?.[0] ||
                user?.email?.[0] ||
                "?"
              ).toUpperCase()
            )}
          </div>

          <p className="mt-2 text-sm font-semibold text-gray-700">
            {user?.name || "Unnamed User"}
          </p>
        </div>
        {/* Other Menu Items */}
        <div
          onClick={() => {
            setFilter("all");
            onClose();
          }}
        >
          <SideBarItem icon={<DocIcon size="lg" />} text="All" />
        </div>

        <div
          onClick={() => {
            setFilter("youtube");
            onClose();
          }}
        >
          <SideBarItem icon={<YoutubeIcon />} text="Youtube" />
        </div>

        <div
          onClick={() => {
            setFilter("twitter");
            onClose();
          }}
        >
          <SideBarItem icon={<TwitterIcon />} text="Twitter" />
        </div>

        <div
          onClick={() => {
            setFilter("notes");
            onClose();
          }}
        >
          <SideBarItem icon={<NotesIcon size="lg" />} text="Notes" />
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
