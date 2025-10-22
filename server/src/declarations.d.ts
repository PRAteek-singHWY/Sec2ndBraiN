// server/src/declarations.d.ts

declare module "twitter-fetcher" {
  // You can add more properties here if you need them from the tweet object
  export interface Tweet {
    id: string;
    text: string;
    name?: string;
    username?: string;
    // ... any other properties
  }

  export function getTweet(tweetId: string): Promise<Tweet>;
}









// server/src/services/embeddingService.ts



// import { GoogleGenerativeAI } from "@google/generative-ai"; // 👈 New Import

import dotenv from "dotenv";

import { index } from "./pineconeClient";

import axios from "axios"; // Using axios for the Jina AI API call



dotenv.config();



// Optional: define PineconeRecord if not imported

type PineconeRecord<T = Record<string, any>> = {

id: string;

values: number[];

metadata: T;

};



// This function is perfect and needs no changes.

function chunkText(text: string, chunkSize = 800, overlap = 200): string[] {

if (!text || text.trim() === "") {

return [];

}

if (chunkSize <= overlap) {

throw new Error(

`❌ Invalid params: chunkSize (${chunkSize}) must be greater than overlap (${overlap})`

);

}

const chunks: string[] = [];

let start = 0;

while (start < text.length) {

const end = Math.min(text.length, start + chunkSize);

chunks.push(text.slice(start, end));

start += chunkSize - overlap;

}

return chunks;

}



// --- UPDATED: The getEmbedding function now uses Gemini ---

export async function getEmbedding(text: string): Promise<number[]> {

try {

const response = await axios.post(

"https://api.jina.ai/v1/embeddings",

{

input: [text],

model: "jina-embeddings-v2-base-en",

},

{

headers: {

Authorization: `Bearer ${process.env.JINA_API_KEY}`,

"Content-Type": "application/json",

},

}

);

const embedding = response.data.data[0].embedding;

if (!embedding) {

throw new Error("Invalid embedding response from Jina AI.");

}

return embedding;

} catch (err) {

console.error("❌ Jina AI embedding error:", err);

throw err;

}

}

// ---



// This custom type guard is perfect and needs no changes.

function isValidUpsert(item: PineconeRecord | null): item is PineconeRecord {

return item !== null;

}



// This function is perfect and needs no changes, as it just uses getEmbedding.

export async function storeEmbeddingForDoc(

docId: string,

fullText: string,

metadata: Record<string, any> = {}

) {

if (!fullText || fullText.trim().length === 0) {

console.warn(`⚠️ Skipping empty document ${docId}`);

return;

}



const chunks = chunkText(fullText, 800, 200);

console.log(`✂️ Split doc ${docId} into ${chunks.length} chunks`);



const embeddings = await Promise.all(

chunks.map(async (chunk, i) => {

try {

const embedding = await getEmbedding(chunk);

console.log(`📦 Chunk ${i} → Embedding length: ${embedding.length}`);

return embedding;

} catch (err) {

console.warn(`⚠️ Skipping chunk ${i} due to embedding error`);

return null;

}

})

);



const upserts: (PineconeRecord | null)[] = embeddings.map((vector, i) => {

if (!vector || vector.length === 0 || !Number.isFinite(vector[0]))

return null;



return {

id: `${docId}_chunk_${i}`,

values: vector,

metadata: {

docId,

chunkIndex: i,

text: chunks[i].slice(0, 1000),

...metadata,

},

};

});



const validUpserts = upserts.filter(isValidUpsert);



if (validUpserts.length === 0) {

console.warn(`⚠️ No valid embeddings to upsert for doc ${docId}`);

return;

}



console.log(

`🔼 Upserting ${validUpserts.length} vectors for doc ${docId} into Pinecone`

);



try {

await index.upsert(validUpserts);

console.log(`✅ Successfully upserted embeddings for doc ${docId}`);

} catch (err) {

console.error("❌ Failed to upsert to Pinecone:", err);

}

}



// This function is perfect and needs no changes, as it just uses getEmbedding.

export async function searchVectorDB(query: string, topK = 5) {

const qVector = await getEmbedding(query);



const resp = await index.query({

vector: qVector,

topK,

includeMetadata: true,

includeValues: false,

});



return (resp.matches || []).map((m: any) => ({

id: m.id,

score: m.score,

metadata: m.metadata,

}));

}













import { Content, Tag, User } from "../models/db";

import mongoose from "mongoose";

import { z } from "zod";

import { Request, Response } from "express";

import dotenv from "dotenv";

dotenv.config();

import { nanoid } from "nanoid"; // to generate unique links import { error } from "console"; import { type } from "os"; import { link } from "fs";

import { storeEmbeddingForDoc } from "../services/embeddingService";

import { index } from "../services/pineconeClient";

import { extractContentFromLink } from "../services/contentExtractor";

dotenv.config();



interface AuthenticatedRequest extends Request {

userId?: string;

}



const contentSchema = z

.object({

title: z.string().min(1),

link: z.string().url("Must be a valid URL").optional(),

type: z.enum(["youtube", "twitter", "other", "notes"]),

tags: z.array(z.string()).optional(),

note: z.string().optional(),

})

.refine(

(data) => {

if (data.type === "notes") {

return !data.link; // notes should not have link

}

return true;

},

{ message: "Notes should not contain a link" }

);



// --- ADD CONTENT ---

export const userAddContent = async (

req: AuthenticatedRequest,

res: Response

) => {

const parsed = contentSchema.safeParse(req.body);

if (!parsed.success) {

return res.status(400).json({ error: parsed.error.format() });

}

const { tags = [] } = parsed.data;



try {

// 1) Resolve tags

const tagIds: mongoose.Types.ObjectId[] = [];

for (const tagTitle of tags) {

let tag = await Tag.findOne({ tagTitle });

if (!tag) {

tag = await Tag.create({ tagTitle });

}

tagIds.push(tag._id);

}



// 2) Create content in Mongo

const content = await Content.create({

userId: req.userId,

title: parsed.data.title,

link: parsed.data.link,

type: parsed.data.type,

tags: tagIds,

note: parsed.data.note,

});



// 3) Extract content from the link if it exists

const extractedContent = await extractContentFromLink(

parsed.data.type,

parsed.data.link

);



console.log(">>>> Extracted Content:", extractedContent);



// 4) Build text for embedding (Now with real content!)

const embedText = `${parsed.data.title}\n\n${

parsed.data.note || ""

}\n\n${extractedContent}`;

















// 5) Store embedding

try {

await storeEmbeddingForDoc(content._id.toString(), embedText, {

// IMPORTANT: Add the link to the metadata here!

title: parsed.data.title,

type: parsed.data.type,

link: parsed.data.link, // This lets you show the source link in search results

userId: req.userId,

});

} catch (err) {

console.error("⚠️ Failed to store embedding:", err);

}



// 5) Return populated doc

const populated = await Content.findById(content._id).populate("tags");

return res.json({

message: "Content created",

contentId: content._id,

populated,

});

} catch (err) {

console.error("Error creating content:", err);

return res.status(500).json({ error: "Internal Server error" });

}

};











// --- GET CONTENT ---

export const userGetContent = async (

req: AuthenticatedRequest,

res: Response

) => {

try {

const contents = await Content.find({ userId: req.userId }).populate(

"tags"

);

if (!contents) {

return res.status(404).json({ error: "Content not found" });

}

return res.status(200).json({ contents });

} catch {

return res.status(500).json({ error: "Error fetching content" });

}

};



// --- DELETE CONTENT ---

// server/src/controllers/contentController.ts



interface AuthenticatedRequest extends Request {

userId?: string;

}



export const userDeleteContent = async (

req: AuthenticatedRequest,

res: Response

) => {

const { contentId } = req.body;

const userId = req.userId;



if (!contentId) {

return res.status(400).json({ error: "Content ID is required" });

}



try {

// 1️⃣ Delete from Mongo

const deleted = await Content.findOneAndDelete({

_id: contentId,

userId,

});



if (!deleted) {

return res.status(404).json({ error: "Content not found" });

}



// vector database

// 2️⃣ Delete all embeddings for this docId from Pinecone

await index.namespace("default").deleteMany({

filter: { docId: contentId },

});



return res

.status(200)

.json({ message: "Content deleted from Mongo & Pinecone" });

} catch (err) {

console.error("Error deleting content:", err);

return res.status(500).json({ error: "Failed to delete content" });

}

};



// --- UPDATE CONTENT ---

const contentUpdateSchema = z.object({

contentId: z.string().min(1),

title: z.string().min(1).optional(),

link: z.string().min(1).optional(),

});



export const userUpdateContent = async (

req: AuthenticatedRequest,

res: Response

) => {

const parsed = contentUpdateSchema.safeParse(req.body);

if (!parsed.success) {

return res.status(400).json({ error: parsed.error.format() });

}

const { contentId, title, link } = parsed.data;

const userId = req.userId;

try {

const content = await Content.findOne({

_id: contentId,

userId: userId,

});

if (!content) {

return res.status(404).json({ error: "Content not found" });

}

if (title !== undefined) content.title = title;

if (link !== undefined) content.link = link;

await content.save();

return res.status(200).json({

message: "Content Updated Successfully",

updateContent: content,

});

} catch (error) {

console.log("Error updating content:", error);

return res.status(500).json({ error: "Internal Server error" });

}

};



// --- SHARE PROFILE / ACCESS SHARED CONTENT ---

export const userShareContent = async (

req: AuthenticatedRequest,

res: Response

) => {

try {

const user = await User.findById(req.userId);

if (!user) return res.status(404).json({ error: "User not found" });



const shareLink = nanoid(12);

user.profileShareLink = shareLink;

user.isProfileSharingEnabled = true;

await user.save();



return res.status(200).json({

message: "Profile sharing enabled",

profileShareLink: `${process.env.CLIENT_URL}/profile/${shareLink}`,

});

} catch {

return res.status(500).json({ error: "Could not enable profile sharing" });

}

};



export const userRevokeProfileShare = async (

req: AuthenticatedRequest,

res: Response

) => {

try {

const user = await User.findById(req.userId);

if (!user) return res.status(404).json({ error: "User not found" });



user.isProfileSharingEnabled = false;

user.profileShareLink = null;

await user.save();



return res.status(200).json({ message: "Profile sharing disabled" });

} catch {

return res.status(500).json({ error: "Could not disable profile sharing" });

}

};



export const userAccessSharedContent = async (req: Request, res: Response) => {

const { shareLink } = req.params;



try {

const user = await User.findOne({

profileShareLink: shareLink,

isProfileSharingEnabled: true,

});



if (!user)

return res

.status(404)

.json({ error: "Profile not found or sharing disabled" });



const contents = await Content.find({ userId: user._id }).populate("tags");



return res.status(200).json({

profile: {

name: user.name,

bio: user.bio,

profilePic: user.profilePic,

username: user.username,

},

contents,

});

} catch {

return res.status(500).json({ error: "Could not fetch shared profile" });

}

};





















// server/src/controllers/searchAIController.ts



import { Request, Response } from "express";

import { getEmbedding } from "../services/embeddingService";

import { index } from "../services/pineconeClient";

import Groq from "groq-sdk";



const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });



export const searchAI = async (req: Request, res: Response) => {

try {

const { query, history = [], filter = "all" } = req.body;

if (!query) {

return res.status(400).json({ error: "❌ Query missing" });

}



// Step 1: Embed user query and search Pinecone

const queryEmbedding = await getEmbedding(query);



const queryRequest: any = {

vector: queryEmbedding,

topK: 5,

includeMetadata: true,

includeValues: false,

};



if (filter && filter !== "all") {

queryRequest.filter = { type: { $eq: filter } };

}



const results = await index.query(queryRequest);




// Step 2: Build context string from matches

const context = results.matches.length

? results.matches.map((m) => m.metadata?.text || "").join("\n\n---\n\n")

: "No relevant results found.";



// Step 3: Rewrite user query into an optimized query using Groq

const optimizePrompt = [

{

role: "system",

content:

"You are a query optimizer. Rewrite the user's question into a clearer, more specific natural-language query that incorporates the provided context. Keep it concise and relevant.",

},

{

role: "user",

content: `USER QUERY: ${query}\n\nCONTEXT:\n${context}`,

},

];



const optimizedQueryResp = await groq.chat.completions.create({

messages: optimizePrompt as any,

model: "llama-3.1-8b-instant",

});



const optimizedQuery =

optimizedQueryResp.choices[0]?.message?.content?.trim() || query;



// Step 4: Format history

const formattedHistory = history

.map((msg: any) => ({

role: msg.role === "model" ? "assistant" : "user",

content: msg.parts?.[0]?.text || "",

}))

.filter((msg: any) => msg.content);



// Step 5: Build final messages for answering

const messages = [

{

role: "system",

content: `You are a helpful assistant. Use the provided CONTEXT to answer the user's QUESTION. If the answer cannot be found in the context, say 'I don’t know based on the given information.'`,

},

...formattedHistory,

{

role: "user",

content: `CONTEXT:\n${context}\n\nOPTIMIZED QUESTION:\n${optimizedQuery}`,

},

];



// Step 6: Get final answer

const chatCompletion = await groq.chat.completions.create({

messages: messages as any,

model: "llama-3.1-8b-instant",

});



const answer =

chatCompletion.choices[0]?.message?.content?.trim() ||

"Sorry, I couldn't generate an answer.";



// Step 7: Return response to the frontend

return res.json({

userQuery: query,

optimizedQuery,

answer,

sources: results.matches.map((m) => ({

id: m.id,

score: m.score,

...m.metadata,

})),

// MODIFIED: Return the final 'messages' array for the frontend to display

promptMessages: messages,

});

} catch (err: any) {

console.error("❌ AI Search Error:", err);

return res.status(500).json({

error: "AI Search failed. Try again later.",

details: err.message,

});

}

};

















