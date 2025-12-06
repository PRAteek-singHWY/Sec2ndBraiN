import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../components/Card"; // Assuming you have this
import { accessSharedProfile } from "../api/content";

export const SharedProfile = () => {
  // 1. Get the unique string from the URL (e.g., "z11m0KmYWs72")
  const { shareLink } = useParams();

  // 2. State to hold the data coming from the backend
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!shareLink) return;

      try {
        // 3. THIS IS WHERE YOU USE THE FUNCTION
        // It calls GET /api/v1/brain/:shareLink
        const data = await accessSharedProfile(shareLink);

        // 4. Save the data to state
        setProfileData(data); // data contains { profile: {...}, contents: [...] }
        setLoading(false);
      } catch (e) {
        console.error("Failed to load profile", e);
        setError(true);
        setLoading(false);
      }
    }

    fetchData();
  }, [shareLink]); // Run this whenever the link changes

  if (loading)
    return <div className="p-8 text-center">Loading Shared Brain...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Profile not found or sharing disabled.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 max-w-4xl mx-auto flex items-center gap-4">
        <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center text-2xl font-bold text-purple-700">
          {/* Fallback Initial if no pic */}
          {profileData.profile.username[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {profileData.profile.username}'s Second Brain
          </h1>
          <p className="text-gray-500">
            {profileData.contents.length} items shared
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {profileData.contents.map((c: any) => (
          <Card
            key={c._id}
            contentId={c._id}
            title={c.title}
            link={c.link}
            type={c.type}
            tags={c.tags?.map((t: any) => t.tagTitle)}
            note={c.note}
          />
        ))}
      </div>
    </div>
  );
};
