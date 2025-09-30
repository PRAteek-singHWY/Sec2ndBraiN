interface AIQueryBarProps {
  onOpen: () => void;
}

export const AIQueryBar = ({ onOpen }: AIQueryBarProps) => {
  return (
    <div className="w-full flex justify-center mb-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpen}
            className="w-full rounded-full px-6 py-3 text-left bg-white shadow-sm hover:shadow-md border border-purple-200 flex items-center justify-between"
          >
            <span className="text-gray-500">
              Search your saved content & chat with AI...
            </span>
            <span className="ml-4 text-sm text-purple-600 font-medium">⌘K</span>
          </button>
        </div>
      </div>
    </div>
  );
};
