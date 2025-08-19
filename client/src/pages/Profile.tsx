import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user } = useContext(AuthContext);

  const initials =
    user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {user?.profilePic ? (
        <img
          src={user.profilePic}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
        />
      ) : (
        <div className="w-32 h-32 rounded-full bg-purple-600 text-white flex items-center justify-center text-5xl font-bold">
          {initials}
        </div>
      )}

      <h1 className="mt-4 text-2xl font-bold">
        {user?.name || "Unknown User"}
      </h1>
      <p className="text-gray-600">{user?.email || "No email available"}</p>
    </div>
  );
};

export default Profile;
