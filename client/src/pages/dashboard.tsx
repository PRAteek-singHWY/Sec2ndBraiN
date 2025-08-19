import { useState } from "react";
import { PlusIcon } from "../assets/icons/PlusIcon";
import { ShareIcon } from "../assets/icons/ShareIcon";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CreateContentModal } from "../components/CreateContentModal";
import { SideBar } from "../components/SideBar";
import { Logo } from "../assets/icons/Logo"; // Import your Logo here
import { HamIcon } from "../assets/icons/HamIcon";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [sideBar, setSideBarOpen] = useState(false);

  // Store all user-added contents
  const [contents, setContents] = useState<
    { title: string; link: string; tags: string[] }[]
  >([]);

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
        <Card
          type="twitter"
          title="BlockCHain"
          link="https://x.com/blockchain/status/1880310548396687562"
        />
        <Card
          type="youtube"
          title="Solana"
          link="https://www.youtube.com/watch?v=5X1uwNJkZFw"
        />

        {/* Add more Cards here in production different for each user */}

        {contents.map((c, i) => (
          <Card type />
        ))}
      </div>

      {/* Create Content Modal */}
      {modalOpen && (
        <CreateContentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={(data) => {
            // This runs when user clicks Submit inside modal
            setContents((prev) => [...prev, data]);
          }}
        />
      )}

      {/* Sidebar */}
      {sideBar && (
        <SideBar isOpen={sideBar} onClose={() => setSideBarOpen(false)} />
      )}
    </div>
  );
}

export default Dashboard;
