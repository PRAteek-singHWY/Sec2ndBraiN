import { ShareIcon } from "../assets/icons/ShareIcon";
import { DeleteIcon } from "../assets/icons/DeleteIcon";
import { DocIcon } from "../assets/icons/DocIcon";
import { EditIcon } from "../assets/icons/EditIcon";
import { deleteContent, updateContent } from "../api/content";

interface CardProps {
  contentId: string;
  title: string;
  link?: string; // link optional now for notes
  type: string;
  tags: string[];
  note?: string; // NEW: content of the note
  onDeleteLocal?: (id: string) => void;
  onUpdateLocal?: (
    id: string,
    updated: { title: string; link?: string; note?: string }
  ) => void;
  readonly?: boolean;
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
  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    try {
      await deleteContent(contentId);
      onDeleteLocal?.(contentId);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  // Handle edit
  const handleEdit = async () => {
    const newTitle = prompt("Enter new title:", title);
    let newLink: string | undefined;
    let newNote: string | undefined;

    if (type === "notes") {
      newNote = prompt("Enter your note:", note);
    } else {
      newLink = prompt("Enter new link:", link);
    }

    if (!newTitle && !newLink && !newNote) return;

    try {
      await updateContent({
        contentId,
        title: newTitle || title,
        link: newLink || link,
        note: newNote || note,
      });

      onUpdateLocal?.(contentId, {
        title: newTitle || title,
        link: newLink || link,
        note: newNote || note,
      });
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  return (
    <div>
      <div className="p-4 bg-white shadow-lg shadow-xl/20 rounded-md border-1 border-gray-200 max-w-72">
        <div className="flex justify-between text-md">
          <div className="flex text-gray-500 items-center">
            <div className="text-purple-600 border-1">
              <DocIcon size="md" />
            </div>
          </div>
          {title}
          <div className="flex gap-2 text-gray-500 items-center">
            {link && type !== "notes" && (
              <a
                href={link}
                target="_blank"
                className="cursor-pointer hover:text-purple-400"
              >
                <ShareIcon size="md" />
              </a>
            )}
            <div
              className="cursor-pointer hover:text-purple-400"
              onClick={handleEdit}
            >
              <EditIcon size="md" />
            </div>
            <div
              className="cursor-pointer hover:text-purple-400"
              onClick={handleDelete}
            >
              <DeleteIcon size="md" />
            </div>
          </div>
        </div>

        <div className="pt-4">
          {type === "youtube" && link && (
            <iframe
              className="w-full h-full"
              src={link.replace("watch", "embed").replace("?v=", "/")}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          )}

          {type === "twitter" && link && (
            <blockquote className="twitter-tweet">
              <a href={link.replace("x.com", "twitter.com")}></a>
              <script
                async
                src="https://platform.twitter.com/widgets.js"
                charSet="utf-8"
              ></script>
            </blockquote>
          )}

          {/* Notes rendering */}
          {type === "notes" && note && (
            <div className="mt-2 p-3 bg-purple-300 rounded-md border border-purple-400 text-gray-700">
              {note}
            </div>
          )}

          {/* Tags Section */}
          {tags && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
