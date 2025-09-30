// src/components/AIAnswerCard.tsx
interface Message {
  role: "user" | "assistant";
  text: string;
}

interface AIAnswerCardProps {
  messages: Message[]; // conversation messages to render
  latestSources?: any[]; // context used for the last answer
}

export const AIAnswerCard = ({ messages }: AIAnswerCardProps) => {
  return (
    <div className="w-full">
      <div className="space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${
              m.role === "assistant" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line ${
                m.role === "assistant"
                  ? "bg-white shadow"
                  : "bg-purple-200 text-purple-900"
              }`}
            >
              <div className="text-sm">{m.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
