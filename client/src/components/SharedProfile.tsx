import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card } from "../components/Card";

export const SharedProfile = () => {
  const { shareLink } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/v1/brain/${shareLink}`
        );
        setProfile(res.data.profile);
        setContents(res.data.contents);
      } catch {
        alert("Profile not found or sharing disabled");
      }
    })();
  }, [shareLink]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{profile.name || profile.username}</h1>
      {profile.bio && <p className="text-gray-600">{profile.bio}</p>}
      {profile.profilePic && (
        <img
          src={profile.profilePic}
          alt="Profile"
          className="w-20 h-20 rounded-full"
        />
      )}

      <div className="mt-6 flex gap-4 flex-wrap">
        {contents.map((c) => (
          <Card
            key={c._id}
            contentId={c._id}
            title={c.title}
            link={c.link}
            type={c.type}
            tags={c.tags?.map((t: any) => t.tagTitle)}
            note={c.note}
            readonly // 🔒 we’ll add this prop in Card so it doesn’t show edit/delete
          />
        ))}
      </div>
    </div>
  );
};
