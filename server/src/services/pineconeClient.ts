// server/src/pineconeClient.ts
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();
// 3:55-4:55
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const index = pinecone.index(process.env.PINECONE_INDEX!);


// Helper to delete one vector
export async function deleteOne(id: string) {
  try {
    await index.deleteOne(id);
    console.log(`🗑️ Deleted vector ${id} from Pinecone`);
  } catch (err) {
    console.error("❌ Pinecone Delete Error:", err);
  }
}
