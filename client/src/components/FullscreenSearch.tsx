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
}

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
    } catch (err) {
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
                    className="flex-1 rounded-full border px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400"
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
            <aside className="w-80 border-l pl-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Context (top matches)
              </h4>
              <div className="space-y-3 max-h-[56vh] overflow-auto">
                {latestSources.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    Context will appear here after the first response.
                  </div>
                ) : (
                  latestSources.map((s: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white border rounded-lg">
                      <div className="text-sm font-medium text-gray-800 break-words">
                        {typeof s === "string"
                          ? s
                          : s.title ||
                            s.link ||
                            JSON.stringify(s).slice(0, 400)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};
