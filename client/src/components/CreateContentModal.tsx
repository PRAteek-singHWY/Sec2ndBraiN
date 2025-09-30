import { useRef, useEffect, useState } from "react";
import { CrossIcon } from "../assets/icons/CrossIcon";
import { Button } from "./Button";
import { Input } from "../components/Input";
import { NewContentPayload } from "../api/content";

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: NewContentPayload) => void | Promise<void>;
}

export const CreateContentModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateContentModalProps) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const [type, setType] = useState<string>(""); // NEW: track selected type

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // CreateContentModal.tsx

  const handleSubmit = () => {
    const title = titleRef.current?.value?.trim() || "";
    const link = linkRef.current?.value?.trim() || "";
    const tagsValue = tagsRef.current?.value || "";
    const note = noteRef.current?.value?.trim() || "";

    // Validation
    if (!title || !type || (type !== "notes" && !link)) {
      alert(
        type === "notes"
          ? "Please enter title and select a Link Type."
          : "Please enter title, link and select a Link Type."
      );
      return;
    }

    const tagsArray = tagsValue
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    // ✅ FIX: We only build ONE payload object
    const payload: NewContentPayload = {
      title,
      tags: tagsArray,
      type: type, // Use the state variable 'type'
      note,
    };

    if (type !== "notes") {
      payload.link = link;
    }

    // ✅ FIX: We only call onSubmit ONCE with the final payload
    onSubmit?.(payload);

    // Clear inputs after submit
    if (titleRef.current) titleRef.current.value = "";
    if (linkRef.current) linkRef.current.value = "";
    if (tagsRef.current) tagsRef.current.value = "";
    if (typeRef.current) typeRef.current.value = "";

    setType(""); // reset type
    onClose();
  };

  return (
    <div className="w-screen h-screen bg-purple-300 fixed top-0 left-0 opacity-98 flex justify-center items-center">
      <div
        ref={modalRef}
        className="flex flex-col bg-white p-4 rounded shadow-lg w-[350px]"
      >
        {/* Close button */}
        <div className="flex justify-end">
          <div
            onClick={onClose}
            className="cursor-pointer text-purple-500 hover:text-purple-600"
          >
            <CrossIcon size="lg" />
          </div>
        </div>

        <Input placeholder="Title" ref={titleRef} />
        {type !== "notes" && <Input placeholder="Link" ref={linkRef} />}

        <select
          ref={typeRef}
          className="border-gray-300 border-1 rounded px-2 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400 ml-2 text-gray-500"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="" disabled>
            Link Type
          </option>
          <option value="youtube">youtube</option>
          <option value="twitter">twitter</option>
          <option value="notes">notes</option>
        </select>
        {type === "notes" && (
          <textarea
            ref={noteRef}
            placeholder="Make your note"
            className="border-gray-300 border rounded px-2 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400 w-full"
          />
        )}

        <Input placeholder="Tags (comma separated)" ref={tagsRef} />

        {/* Submit button */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            text="Submit"
            size="md"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};
