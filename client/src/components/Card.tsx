import { ShareIcon } from "../assets/icons/ShareIcon";
import { DeleteIcon } from "../assets/icons/DeleteIcon";
import { DocIcon } from "../assets/icons/DocIcon";
import { EditIcon } from "../assets/icons/EditIcon";
import { deleteContent, updateContent } from "../api/content";
import { useEffect } from "react";

interface CardProps {
  contentId: string;
  title: string;
  link?: string;
  type: string;
  tags: string[];
  note?: string;
  onDeleteLocal?: (id: string) => void;
  onUpdateLocal?: (
    id: string,
    updated: { title: string; link?: string; note?: string }
  ) => void;
}

export const Card = ({
  contentId,
  title,
  link,
  type,
  tags,
  note,
  onDeleteLocal,
  onUpdateLocal,
}: CardProps) => {
  // useEffect to load Twitter's widget script
  useEffect(() => {
    if (type === "twitter" && (window as any).twttr) {
      (window as any).twttr.widgets.load();
    }
  }, [type, link]);

  // Handle delete and edit functions remain the same
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    // 1️⃣ Optimistic update
    onDeleteLocal?.(contentId);

    try {
      await deleteContent(contentId);
    } catch (err) {
      console.error("Failed to delete:", err);
      // Optionally, revert state by refetching
    }
  };
  // Handle edit

  const handleEdit = async () => {
    const newTitle = prompt("Enter new title:", title);
    if (!newTitle && !note && !link) return;

    const newLink =
      type !== "notes" ? prompt("Enter new link:", link) : undefined;
    const newNote = type === "notes" ? prompt("Enter note:", note) : undefined;

    // 1️⃣ Optimistic update
    onUpdateLocal?.(contentId, {
      title: newTitle || title,
      link: newLink || link,
      note: newNote || note,
    });

    try {
      await updateContent({
        contentId,
        title: newTitle || title,
        link: newLink || link,
        note: newNote || note,
      });
    } catch (err) {
      console.error("Failed to update:", err);
      // Optionally, revert state by refetching
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* --- CARD HEADER --- */}
      <div className="flex justify-between items-center p-4">
        {/* MODIFIED: Grouped icon and title for proper spacing and alignment */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-purple-600 flex-shrink-0">
            <DocIcon size="md" />
          </div>
          <h3 className="font-semibold text-gray-800 truncate" title={title}>
            {title}
          </h3>
        </div>

        {/* Action Icons */}
        <div className="flex gap-2 text-gray-500 items-center flex-shrink-0 ml-2">
          {link && type !== "notes" && (
            <a
              href={link}
              target="_blank"
              className="cursor-pointer hover:text-purple-600"
            >
              <ShareIcon size="md" />
            </a>
          )}
          <div
            className="cursor-pointer hover:text-purple-600"
            onClick={handleEdit}
          >
            <EditIcon />
          </div>
          <div
            className="cursor-pointer hover:text-red-500"
            onClick={handleDelete}
          >
            <DeleteIcon size="md" />
          </div>
        </div>
      </div>

      {/* --- CARD BODY --- */}
      <div className="p-4 pt-0 flex-grow">
        {type === "youtube" && link && (
          <div className="aspect-video w-full">
            <iframe
              className="w-full h-full rounded"
              src={link.replace("watch?v=", "embed/")}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {type === "twitter" && link && (
          <blockquote className="twitter-tweet" data-theme="light">
            <a href={link.replace("x.com", "twitter.com")}></a>
          </blockquote>
        )}

        {type === "notes" && note && (
          <div className="text-sm text-gray-700 bg-purple-300 p-3 rounded-md border max-h-48 overflow-auto">
            <p className="whitespace-pre-wrap">{note}</p>
          </div>
        )}
      </div>

      {/* --- CARD FOOTER (TAGS) --- */}
      {tags && tags.length > 0 && (
        <div className="p-4  mt-auto">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
