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

export async function userShareProfile() {
  const res = await API.post("/brain/share"); // JWT auth header included
  return res.data;
}

export async function accessSharedProfile(shareLink: string) {
  const res = await API.get(`/brain/${shareLink}`);

  return res.data;
}
