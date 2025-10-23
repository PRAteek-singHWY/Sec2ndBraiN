// src/components/FullscreenSearch.tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { AIAnswerCard } from "./AIAnswerCard";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface FullscreenSearchProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    query: string
  ) => Promise<{ answer: string; sources?: any[]; sessionId?: string }>;
  sessionId?: string | null;
  messages: Message[]; // Dashboard state
  latestSources: any[]; // Dashboard state
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setLatestSources: React.Dispatch<React.SetStateAction<any[]>>;
  loading?: boolean;
  filter: string;
  optimizedQuery: string; // <-- Add the new prop

  setFilter: (filter: "all" | "youtube" | "twitter" | "notes") => void;
}

// A new sub-component for the filter buttons
const FilterButtons = ({ filter, setFilter }) => {
  const options = ["all", "youtube", "twitter", "notes"];
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-semibold text-gray-500">Search in:</span>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setFilter(option)}
          className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
            filter === option
              ? "bg-purple-600 text-white font-semibold"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

// NEW: A sub-component to display the prompt nicely
const PromptDisplay = ({ query }) => {
  const displayText = query || "The optimized question will appear here.";
  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
      <h5 className="font-bold text-green-800 mb-1 text-xs">
        Optimized Query (with context)
      </h5>
      <p className="text-green-700 text-sm">{displayText}</p>
    </div>
  );
};

export const FullscreenSearch = ({
  open,
  onClose,
  onSubmit,
  sessionId = null,
  messages,
  latestSources,
  setMessages,
  setLatestSources,
  loading = false,
  filter,
  optimizedQuery,

  setFilter,
}: FullscreenSearchProps) => {
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  // Auto-scroll on new messages or sources
  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, latestSources]);

  const handleSend = async () => {
    if (!query.trim()) return;
    const userText = query.trim();
    // setting up the messages with query sent by the user
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setQuery("");
    setIsSubmitting(true);

    try {
      const res = await onSubmit(userText);
      // setMessages((prev) => [...prev, { role: "assistant", text: res.answer }]);
      setLatestSources(res.sources || []);
    } catch (err: any) {
      const errorText =
        err.response?.data?.message || "Error getting response. Try again.";
      // setting up the messages with response from assistant
      setMessages((prev) => [...prev, { role: "assistant", text: errorText }]);
      // Use global console, no import needed
      console.error("Search submit failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/40 backdrop-blur-sm">
      <div className="m-8 mx-auto w-full max-w-4xl bg-transparent">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Search & Chat — Your Saved Content
              </h3>
              <span className="text-sm text-gray-500">
                Context-aware search of your saved links
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 mr-4">
                Session:{" "}
                <span className="font-mono ml-1">
                  {sessionId ? sessionId.slice(0, 8) : "new"}
                </span>
              </div>
              <Button
                text="Close"
                variant="secondary"
                size="sm"
                onClick={onClose}
              />
            </div>
          </div>

          {/* Messages + context area */}
          <div className="flex-1 overflow-hidden p-6 flex gap-6">
            {/* Messages column */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* NEW: Add the filter buttons here */}

              <FilterButtons filter={filter} setFilter={setFilter} />

              <div ref={scrollerRef} className="flex-1 overflow-auto pr-4">
                <AIAnswerCard messages={messages} />
              </div>

              {/* Input */}
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type a question about your saved content..."
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="
    flex-1
    mb-2
    rounded-full
    border
    border-gray-300
    px-4
    py-3
    outline-none
    focus:border-purple-500
    focus:ring-0
    focus:shadow-[0_0_0_2px_rgba(139,92,246,0.3)]
    transition
    duration-200
    ease-in-out
    box-border
  "
                  />

                  <Button
                    text={isSubmitting || loading ? "Thinking..." : "Send"}
                    variant="primary"
                    size="md"
                    onClick={handleSend}
                  />
                </div>
              </div>
            </div>

            {/* Right: context / sources column */}
            <aside className="w-80 border-l pl-4 flex flex-col">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex-shrink-0">
                Final Prompt to AI
              </h4>
              <div className="flex-1 overflow-auto space-y-3">
                <PromptDisplay query={optimizedQuery} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};
