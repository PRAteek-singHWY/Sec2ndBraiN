// server/src/controllers/searchAIController.ts

import { Request, Response } from "express";
import dotenv from "dotenv";
import { getEmbedding } from "../services/embeddingService";
import { HfInference } from "@huggingface/inference";
import { index } from "../services/pineconeClient";

dotenv.config();

const hf = new HfInference(process.env.HUGGING_FACE_TOKEN);

// Embedding model: we use Hugging Face MiniLM (already in embeddingService.ts)
// Generative model: mistral via a stable provider
const GENERATIVE_MODEL = "HuggingFaceH4/zephyr-7b-beta";

export const searchAI = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "❌ Query missing" });
    }

    // 1️⃣ Embed the query
    const queryEmbedding = await getEmbedding(query);

    // 2️⃣ Retrieve top matches from Pinecone
    const results = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
      includeValues: false,
    });

    // 2.5️⃣ Filter by a relevance threshold
    const THRESHOLD = 0.75; // adjust based on your embeddings
    const filteredMatches = results.matches.filter(
      (m) => m.score !== undefined && m.score >= THRESHOLD
    );

    // 3️⃣ Build context from retrieved docs
    const context = filteredMatches.length
      ? filteredMatches.map((m) => m.metadata?.text || "").join("\n\n---\n\n")
      : "No relevant results found.";

    console.log(">>>> FINAL CONTEXT SENT TO MODEL:", context);

    // 4️⃣ Build messages for LLM
    const messages: { role: "user" | "system"; content: string }[] = [
      {
        role: "system",
        content:
          "You are a helpful assistant. Use the provided CONTEXT to answer the QUESTION. " +
          "If the answer cannot be found in the context, say 'I don’t know based on the given information.'",
      },
      {
        role: "user",
        content: `CONTEXT:
${context}

QUESTION:
${query}`,
      },
    ];

    // 5️⃣ Generate final answer with stable provider
    const result = await hf.chatCompletion({
      model: GENERATIVE_MODEL,
      // provider: PROVIDER, // ✅ pinned provider avoids flaky auto routing
      messages,
      max_tokens: 500,
    });

    const answer =
      result.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't generate an answer.";

    // 6️⃣ Send structured response to frontend
    return res.json({
      answer,
      sources: results.matches.map((m) => ({
        id: m.id,
        score: m.score,
        ...m.metadata,
      })),
    });
  } catch (err: any) {
    console.error("❌ AI Search Error:", err);

    // ✅ Clean error for frontend
    return res.status(500).json({
      error: "AI Search failed. Try again later.",
      details: err.message,
    });
  }
};

// Blockchain in USA ?

// previous query's context should be removed the moment new query is asked
// or if there are some follow up questions in the chat
// when something is asked the context displaying ui should remove previous found context
