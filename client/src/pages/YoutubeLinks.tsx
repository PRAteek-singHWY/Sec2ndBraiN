// pages/YoutubeLinks.tsx
import React from "react";

const YoutubeLinks = () => {
  // Example: In a real app, fetch from DB or context
  const links = [
    "https://youtube.com/watch?v=abc123",
    "https://youtube.com/watch?v=xyz456",
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-purple-600 mb-4">
        Saved YouTube Links
      </h1>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default YoutubeLinks;
