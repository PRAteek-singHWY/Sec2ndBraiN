import { Pinecone } from "@pinecone-database/pinecone";

let client: Pinecone | null = null;

export const getVectorDBClient = () => {
  if (!client) {
    client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return client.index(process.env.PINECONE_INDEX!); // your index name from Pinecone
};
