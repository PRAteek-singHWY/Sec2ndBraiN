import { useEffect, useState } from "react";
import { PlusIcon } from "../assets/icons/PlusIcon";
import { ShareIcon } from "../assets/icons/ShareIcon";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CreateContentModal } from "../components/CreateContentModal";
import { SideBar } from "../components/SideBar";
import { Logo } from "../assets/icons/Logo"; // Import your Logo here
import { HamIcon } from "../assets/icons/HamIcon";
import { useNavigate } from "react-router-dom";
import { getContents, addContent, NewContentPayload } from "../api/content";
import { userShareProfile } from "../api/content"; // add API

// genric type for contents line 28
type ContentDoc = {
  _id: string;
  title: string;
  link: string; // link comes back as body
  type: string;
  tags: { _id: string; tagTitle: string }[];
  note?: string;
};

function Dashboard() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [sideBar, setSideBarOpen] = useState(false);
  // Store all user-added contents
  const [contents, setContents] = useState<ContentDoc[]>([]);
  const [filter, setFilter] = useState<"all" | "youtube" | "twitter" | "notes">(
    "all"
  );

  const handleShareProfile = async () => {
    try {
      const res = await userShareProfile();
      navigator.clipboard.writeText(res.profileShareLink);
      alert("Profile link copied!");
    } catch {
      alert("Could not generate profile link");
    }
  };
  // fetch on mount
  useEffect(() => {
    (async () => {
      try {
        const list = await getContents();
        setContents(list);
        // console.log(list); // Check if note is present
      } catch (e) {
        console.error("Fetch contents failed", e);
      }
    })();
  }, []);

  // filter logic
  const filteredContents = contents.filter((c) => {
    if (filter === "all") return true;
    return c.type.toLowerCase() === filter; // assumes c.type = "youtube" | "twitter" | "notes"
  });

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col">
      {/* Top header */}
      <header className="flex items-center justify-between px-6 py-3 bg-purple-300 shadow-md ">
        {/* Left: Logo and sidebar toggle */}
        <div
          className="flex gap-4 justify-between items-center cursor-pointer 
        "
          onClick={() => navigate("/")}
        >
          <div className=" text-purple-600 " aria-label="Brainly Logo">
            <Logo />
          </div>
          <h1 className="text-3xl font-extrabold  text-purple-600 font-mono">
            Brainly
          </h1>
        </div>

        {/* Right: Buttons */}
        <div className="flex gap-4 ">
          <Button
            variant="primary"
            text="Add Content"
            size="md"
            startIcon={<PlusIcon size="md" />}
            onClick={() => setModalOpen(true)}
          />
          <Button
            variant="secondary"
            text="Share"
            size="md"
            startIcon={<ShareIcon size="md" />}
            onClick={handleShareProfile}
          />
        </div>
      </header>

      {/* triggering sideBar */}
      <div
        className="text-purple-600 cursor-pointer p-2 ml-5"
        onClick={() => setSideBarOpen(true)}
        aria-label="Open Sidebar"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setSideBarOpen(true);
        }}
      >
        <HamIcon size="lg" />
      </div>

      {/* Main content */}
      <div className="flex gap-6 p-6 ml-1.5">
        {filteredContents.map((c) => (
          <Card
            key={c._id}
            contentId={c._id}
            title={c.title}
            link={c.link}
            type={c.type}
            tags={c.tags?.map((t) => t.tagTitle)}
            note={c.note} // pass the note here
            onDeleteLocal={(id) =>
              setContents((prev) => prev.filter((item) => item._id !== id))
            }
            onUpdateLocal={(id, updated) =>
              setContents((prev) =>
                prev.map((item) =>
                  item._id === id ? { ...item, ...updated } : item
                )
              )
            }
          />
        ))}
      </div>

      {/* Create Content Modal */}
      {modalOpen && (
        <CreateContentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={async (data: NewContentPayload) => {
            try {
              console.log(data);
              const created = await addContent(data);
              setContents((prev) => [...prev, created]);
            } catch (err) {
              console.error("Error adding content", err);
            } 
          }}
        />
      )}

      {/* Sidebar */}
      {sideBar && (
        <SideBar
          isOpen={sideBar}
          onClose={() => setSideBarOpen(false)}
          setFilter={setFilter}
        />
      )}
    </div>
  );
}

export default Dashboard;
