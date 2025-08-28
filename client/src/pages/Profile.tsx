import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/v1/update-profile`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
        }
      );
      setUser(res.data.user);
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-gray-400 hover:text-purple-600 cursor-pointer"
        >
          <ArrowLeft className="w-8 h-6 mr-2" />
          Back to Dashboard
        </button>
      </div>

      {/* Avatar */}
      <div className="relative mt-6">
        {user?.profilePic ? (
          <img
            src={user.profilePic}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-purple-600 text-white flex items-center justify-center text-5xl font-bold">
            {user?.initials || "?"}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="mt-8 w-96 bg-white shadow-md rounded-lg p-6 space-y-4">
        {/* Name */}
        <div>
          <p className="text-gray-500 text-sm">Name</p>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p className="text-lg font-semibold">{user?.name || "—"}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <p className="text-gray-500 text-sm">Email</p>
          <p className="text-lg font-semibold">{user?.email}</p>
        </div>

        {/* Phone */}
        <div>
          <p className="text-gray-500 text-sm">Phone</p>
          {isEditing ? (
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p className="text-lg">{user?.phone || "—"}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <p className="text-gray-500 text-sm">Bio</p>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p className="text-lg">{user?.bio || "—"}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
