import { useEffect, useState } from "react";

import { PlusIcon } from "../assets/icons/PlusIcon";

import { ShareIcon } from "../assets/icons/ShareIcon";

import { Button } from "../components/Button";

import { Card } from "../components/Card";

import { CreateContentModal } from "../components/CreateContentModal";

import { SideBar } from "../components/SideBar";

import { HamIcon } from "../assets/icons/HamIcon";

import { useNavigate } from "react-router-dom";

import {
  getContents,
  addContent,
  NewContentPayload,
  userRevokeShareProfile,
  searchAI,
  HistoryMessage,
} from "../api/content";

import { userShareProfile } from "../api/content"; // add API

import { AIQueryBar } from "../components/AIQueryBar";

import console from "console";

import { Logo } from "../assets/icons/Logo";

import { FullscreenSearch } from "../components/FullscreenSearch";

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

  const [searchOpen, setSearchOpen] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);

  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);

  const [latestSources, setLatestSources] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const handleShareProfile = async () => {
    try {
      const res = await userShareProfile();

      navigator.clipboard.writeText(res.profileShareLink);

      alert("Profile link copied!");
    } catch (e) {
      alert("Could not generate profile link");

      console.error(e);
    }
  };

  const handleRevokeShare = async () => {
    try {
      await userRevokeShareProfile();

      alert("Profile sharing disabled");
    } catch (e) {
      alert("Could not disable sharing");
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

  // Called from FullscreenSearch when user sends a message

  // instead of

  // import { v4 as uuidv4 } from "uuid";

  // use:

  const id = crypto.randomUUID();

  const [optimizedQuery, setOptimizedQuery] = useState<string>(""); // <-- NEW STATE

  const handleSearchSubmit = async (query: string) => {
    setLoading(true);

    try {
      // The sessionId is no longer needed for the API call itself

      const sid = sessionId || `sess_${crypto.randomUUID()}`;

      if (!sessionId) setSessionId(sid);

      const history: HistoryMessage[] = messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",

        parts: [{ text: msg.text }],
      }));

      // FIX: Remove the 'sid' argument from this call

      const res = await searchAI(query, history, filter);

      setMessages((prev) => [...prev, { role: "assistant", text: res.answer }]);

      setLatestSources(res.sources || []);

      setOptimizedQuery(res.optimizedQuery || ""); // <-- SET THE NEW STATE

      return res;
    } catch (err: any) {
      console.error("AI search error:", err);

      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Command key on Mac or Control key on Windows/Linux
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        // Prevent the browser's default action (e.g., Chrome's search)
        event.preventDefault();
        // Open your search modal
        setSearchOpen(true);
      }
    };
    // Add the event listener when the component mounts
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // The empty array ensures this effect runs only once

  // ... (the rest of your component logic: handleShareProfile, handleSearchSubmit, etc.)

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col relative">
      {/* Hamburger Icon pinned top-left, outside header */}

      {/* Hamburger Icon pinned top-left, outside header */}
      {!sideBar && (
        <div
          className="absolute top-4 left-4 text-purple-600 p-2 w-max cursor-pointer z-50 mt-16 ml-1.5 "
          role="button"
          tabIndex={0}
          onClick={() => setSideBarOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setSideBarOpen(true);
          }}
        >
          <HamIcon size="lg" />
        </div>
      )}

      {/* Top header */}

      <header className="flex items-center justify-between px-6 py-3 bg-purple-300 shadow-md">
        {/* Left: Logo (click to home) */}

        <div
          className="flex gap-4 justify-between items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="text-purple-600" aria-label="Sec2ndBrain Logo">
            <Logo />
          </div>

          <h1 className="text-3xl font-extrabold text-purple-600 font-mono">
            Sec2ndBrain
          </h1>
        </div>

        {/* Right: Buttons */}

        <div className="flex gap-4">
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

          <Button
            variant="secondary"
            text="Revoke"
            size="md"
            onClick={handleRevokeShare}
          />
        </div>
      </header>

      {/* Search Bar OUTSIDE the header */}

      <div className="px-6 py-4 flex justify-center">
        <AIQueryBar onOpen={() => setSearchOpen(true)} />
      </div>

      {/* Full screen search modal */}

      <FullscreenSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSubmit={handleSearchSubmit}
        sessionId={sessionId}
        messages={messages}
        latestSources={latestSources}
        setMessages={setMessages}
        setLatestSources={setLatestSources}
        loading={loading}
        optimizedQuery={optimizedQuery} // <-- PASS THE NEW PROP
      />

      {/* Main content */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6 ml-1.5">
        {filteredContents.map((c) => (
          <Card
            key={c._id}
            contentId={c._id}
            title={c.title}
            link={c.link}
            type={c.type}
            tags={c.tags?.map((t) => t.tagTitle)}
            note={c.note}
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
        // dashboard.tsx

        <CreateContentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={async (data: NewContentPayload) => {
            try {
              const created = await addContent(data);

              // ✅ FIX: Destructure the 'populated' object from the response

              setContents((prev) => [...prev, created.populated]);
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
