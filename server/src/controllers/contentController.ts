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
        docId: content._id.toString(),
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
  note: z.string().optional(),
});

// Stale Embeddings:

// Problem: When a user updates a title or note, the text in your MongoDB changes, but the old vector in Pinecone is not updated. Your AI search will return results based on the old, stale text.

// The Fix: In userUpdateContent, after saving the content, you must re-calculate the embedText and call storeEmbeddingForDoc again to overwrite the old vector.

export const userUpdateContent = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = contentUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }
  const { contentId, title, link, note } = parsed.data;
  const userId = req.userId;
  try {
    const content = await Content.findOne({
      _id: contentId,
      userId: userId,
    });
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }
    // 2. Track if embeddable content changed
    let needsReEmbedding = false;
    if (title !== undefined && content.title !== title) {
      content.title = title;
      needsReEmbedding = true;
    }
    if (link !== undefined && content.link !== link) {
      content.link = link;
      needsReEmbedding = true;
    }
    if (note !== undefined && content.note !== note) {
      content.note = note;
      needsReEmbedding = true;
    }
    await content.save();

    // 4. =================== NEW EMBEDDING LOGIC ===================
    // If any text field changed, update the vector in Pinecone
    if (needsReEmbedding) {
      console.log(`🔄 Updating embeddings for content: ${content._id}`);
      try {
        // Re-extract content from the (potentially new) link
        const extractedContent = await extractContentFromLink(
          content.type,
          content.link || undefined
        );

        // Re-build the text for embedding using the *updated* data
        const embedText = `${content.title}\n\n${
          content.note || ""
        }\n\n${extractedContent}`;

        // Call storeEmbeddingForDoc to overwrite the old vector
        await storeEmbeddingForDoc(content._id.toString(), embedText, {
          title: content.title,
          type: content.type,
          link: content.link,
          userId: req.userId,
          docId: content._id.toString(),
        });

        console.log(`✅ Embeddings updated for: ${content._id}`);
      } catch (embedError) {
        // Log the error, but don't fail the entire request.
        // The Mongo save already succeeded.
        console.error(
          `⚠️ Failed to update embedding for ${content._id}:`,
          embedError
        );
      }
    }
    // =============================================================

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
