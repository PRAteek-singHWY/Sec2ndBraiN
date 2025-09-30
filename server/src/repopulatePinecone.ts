// server/src/scripts/repopulatePinecone.ts

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Content } from "./models/db"; // Import your Content model
import { extractContentFromLink } from "./services/contentExtractor";
import { storeEmbeddingForDoc } from "./services/embeddingService";

dotenv.config({ path: ".env" }); // Make sure it loads the .env file

const repopulate = async () => {
  console.log("🚀 Starting Pinecone re-population script...");

  // 1. Connect to MongoDB
  const mongoUri = process.env.MONGODB_CONNECTION_STRING;
  if (!mongoUri) {
    console.error("❌ MONGO_URI not found in .env file. Exiting.");
    process.exit(1);
  }
  await mongoose.connect(mongoUri);
  console.log("✅ Successfully connected to MongoDB.");

  // 2. Fetch all existing documents
  const allContent = await Content.find({}).lean(); // .lean() makes it faster
  console.log(`🔍 Found ${allContent.length} documents to process.`);

  // 3. Loop through each document and re-embed it
  for (const doc of allContent) {
    try {
      console.log(`\n🔄 Processing: "${doc.title}" (ID: ${doc._id})`);

      const extractedContent = await extractContentFromLink(
        doc.type,
        doc.link || undefined
      );

      const embedText = `${doc.title}\n\n${
        doc.note || ""
      }\n\n${extractedContent}`;

      // This is the same function your controller uses!
      await storeEmbeddingForDoc(doc._id.toString(), embedText, {
        title: doc.title,
        type: doc.type,
        link: doc.link,
        userId: doc.userId.toString(),
      });
    } catch (err) {
      console.error(`❌ Failed to process document ${doc._id}:`, err);
    }
  }

  console.log("\n🎉 Re-population complete!");
  await mongoose.disconnect();
};

repopulate().catch((err) => {
  console.error("An unexpected error occurred:", err);
  process.exit(1);
});
