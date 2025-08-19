// pages/TwitterLinks.tsx
import React from "react";

const TwitterLinks = () => {
  const links = [
    "https://twitter.com/example/status/12345",
    "https://twitter.com/example/status/67890",
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-purple-600 mb-4">
        Saved Twitter Links
      </h1>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TwitterLinks;
