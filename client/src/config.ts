// client/src/config.ts
// This correctly defaults to localhost:3000 when VITE_API_URL isn't set (locally)
export const BACKEND_URL =
  // import.meta.env.VITE_API_URL || 
  "http://localhost:3000";
