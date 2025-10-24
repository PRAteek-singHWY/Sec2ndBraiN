// This keeps your components clean.
import axios from "axios";
import { BACKEND_URL } from "../config";

const API = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true, // 1. ADDED THIS: This tells axios to send cookies
});

// 2. DELETED: The entire 'localStorage' interceptor is gone.
//    The browser now handles this automatically.

export interface NewContentPayload {
  title: string;
  link?: string; // optional for notes
  tags: string[];
  type: string;
  note?: string; // new field
}

export const addContent = async (payload: NewContentPayload) => {
  const { data } = await API.post("/content", payload);
  return data; // the created content (populated)
};

export const getContents = async () => {
  const { data } = await API.get("/content");
  // backend returns { contents }
  return data.contents;
};

// DELETE content
export const deleteContent = async (contentId: string) => {
  const { data } = await API.delete("/content", { data: { contentId } });
  return data; // { message: "Content deleted" }
};

// UPDATE content
type UpdateContentPayload = {
  contentId: string;
  title?: string;
  link?: string;
  note?: string;
};

export const updateContent = async (payload: UpdateContentPayload) => {
  const { data } = await API.put("/content", payload);
  return data; // { message, updateContent }
};

export const userShareProfile = async () => {
  // 3. REMOVED: The manual 'headers' object. It's no longer needed.
  const res = await API.post("/brain/share", {});
  return res.data;
};

export async function accessSharedProfile(shareLink: string) {
  const res = await API.get(`/brain/${shareLink}`);
  return res.data;
}

export const userRevokeShareProfile = async () => {
  // 3. REMOVED: The manual 'headers' object.
  const res = await API.post(`/profile/revoke`, {});
  return res.data;
};

export const updateUserProfile = async (payload: {
  name?: string;
  phone?: string;
  bio?: string;
}) => {
  const { data } = await API.put(`/update-profile`, payload);
  return data; // { user: updatedUser }
};

// UPLOAD profile picture
export const uploadProfilePic = async (file: File) => {
  const formData = new FormData();
  formData.append("profilePic", file);

  const { data } = await API.post(`/upload-profile-pic`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      // 3. REMOVED: The manual 'Authorization' header.
    },
  });

  return data;
};

// ============================
// 🟣 AI Search Endpoint
// ============================

export type AIResponse = {
  answer: string;
  sources: any[];
  optimizedQuery?: string;
};

export interface HistoryMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export const searchAI = async (
  query: string,
  history: HistoryMessage[],
  filter: string
): Promise<AIResponse> => {
  const payload = {
    query,
    history,
    filter,
  };
  const { data } = await API.post("/search-ai", payload);
  return data as AIResponse;
};
