// server/src/services/embeddingService.ts

import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
import { index } from "./pineconeClient";

dotenv.config();

const hf = new HfInference(process.env.HUGGING_FACE_TOKEN);
const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

// Optional: define PineconeRecord if not imported
type PineconeRecord<T = Record<string, any>> = {
  id: string;
  values: number[];
  metadata: T;
};

// function chunkText(text: string, chunkSize = 800, overlap = 200): string[] {
//   if (!text || text.trim() === "") {
//     return [];
//   }

//   const chunks: string[] = [];
//   let start = 0;

//   while (start < text.length) {
//     const end = Math.min(text.length, start + chunkSize);
//     if (start >= end) break;
//     chunks.push(text.slice(start, end));
//     start = end - overlap;
//   }

//   return chunks;
// }

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
    start += chunkSize - overlap; // ✅ move forward safely
  }

  return chunks;
}

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await hf.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: text,
    });

    if (Array.isArray(response)) {
      if (Array.isArray(response[0])) {
        return response[0] as number[];
      } else if (typeof response[0] === "number") {
        return response as number[];
      }
    }

    throw new Error("Unexpected or empty response from embedding model.");
  } catch (err) {
    console.error("❌ Hugging Face embedding error:", err);
    throw err;
  }
}

// ✅ Custom type guard to satisfy TypeScript
function isValidUpsert(item: PineconeRecord | null): item is PineconeRecord {
  return item !== null;
}

export async function storeEmbeddingForDoc(
  docId: string,
  fullText: string,
  metadata: Record<string, any> = {}
) {
  // ✅ SAFEGUARD #1
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
    // ✅ SAFEGUARD #2
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
  const validUpserts = upserts.filter(isValidUpsert); // ✅ Safe, narrowed to PineconeRecord[]

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
