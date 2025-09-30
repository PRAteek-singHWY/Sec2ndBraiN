// This keeps your components clean.
import axios from "axios";
import { BACKEND_URL } from "../config";
const API = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`, // change to your server URL
});

// attach token if you use JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

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
  link?: string; // since your update schema uses "body" to update link
  note?: string; // new field
};

export const updateContent = async (payload: UpdateContentPayload) => {
  const { data } = await API.put("/content", payload);
  return data; // { message, updateContent }
};

export const userShareProfile = async () => {
  const res = await API.post(
    "/brain/share", // <-- add the leading slash
    {},
    {
      headers: {
        // will have to send jwt token for middleWare
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return res.data;
};

export async function accessSharedProfile(shareLink: string) {
  const res = await API.get(`/brain/${shareLink}`);

  return res.data;
}

export const userRevokeShareProfile = async () => {
  const res = await API.post(
    `/profile/revoke`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
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
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return data;
};

// ============================
// 🟣 AI Search Endpoint
// ============================

export interface AIResponse {
  answer: string;
  sources?: any[];
  sessionId?: string;
}

// query + optional sessionId for multi-turn

// NEW: Define the type for a message in the conversation history
export interface HistoryMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// MODIFIED: The searchAI function now accepts history and a filter
export const searchAI = async (
  query: string,
  history: HistoryMessage[],
  filter: string
): Promise<AIResponse> => {
  // The payload now includes the query, history, and filter
  const payload = {
    query,
    history,
    filter,
  };
  const { data } = await API.post("/search-ai", payload);
  return data as AIResponse;
};

// what  is that part which is sending request to backend

// it is inside handleSubmit whihc is being givento  to onSubmit
// inside Fullscreen.tsx and then inside handleSubmit we are calling searchAI(qury) from Content.ts

// now when i am adding data to my backend database mongoDB
// iam also sendinga t the same time to. my vector database the teh same stuff

// then embedding file is hgelping in converting that data into embedding and savig in vector databse
