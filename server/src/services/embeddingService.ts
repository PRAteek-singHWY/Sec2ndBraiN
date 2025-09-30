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
