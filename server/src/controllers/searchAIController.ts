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
