import { Content } from "../models/db";
import { Request, Response } from "express";
import { trim, z } from "zod";

import { nanoid } from "nanoid";
// to generate unique links
import { error } from "console";

// ADD CONTENT
//
//
//
//
//
//
//
//
//
//
//
//
//
//
interface AuthenticatedRequest extends Request {
  userId?: string;
}

const contentSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

// it's because you're using the default Express Request type, which doesn't know about your custom userId added in the middleware.
export const userAddContent = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = contentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  try {
    const content = await Content.create({
      // middleware
      userId: req.userId,
      title: parsed.data.title,
      body: parsed.data.body,
    });
    res.json({
      message: "Content created",
      contentId: content._id,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server error" });
  }
};
// GET CONTENT
//
//
//
//
//
//
//
//
//
//
//
//
//
//
export const userGetContent = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const contents = await Content.find({ userId: req.userId });
    return res.status(200).json({ contents });
  } catch {
    return res.status(500).json({ error: "Error fetching content" });
  }
};
// DELETE CONTENT
//
//
//
//
//
//
//
//
//
//
//
//
//
//

export const userDeleteContent = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { contentId } = req.body;
  const userId = req.userId;
  if (!contentId)
    return res.status(400).json({ error: "Content ID is required" });

  try {
    const deleted = await Content.findOneAndDelete({
      _id: contentId,
      userId: userId,
    });
    if (!deleted) return res.status(404).json({ error: "Content not found" });
    return res.status(200).json({ message: "Content deleted" });
  } catch {
    return res.status(500).json({ error: "Failed to delete content" });
  }
};
// UPDATE CONTENT
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// schema for validating update
const contentUpdateSchema = z.object({
  contentId: z.string().min(1),
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
});
export const userUpdateContent = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = contentUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }
  const { contentId, title, body } = parsed.data;
  const userId = req.userId;
  try {
    const content = await Content.findOne({
      _id: contentId,
      userId: userId,
    });
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }
    // update content
    if (title !== undefined) content.title = title;
    if (body !== undefined) content.body = body;
    // saving updates to database
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

// CREATE SHAREABLE LINK FOR CONTENT
//
//
//
//
//
//
//
//
//
//
//
//
//
//
export const userShareContent = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { contentId } = req.body;
  const userId = req.userId;
  if (!contentId)
    return res.status(400).json({ error: "Content ID is required" });

  try {
    const content = await Content.findOne({
      _id: contentId,
      userId: userId,
    });
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    const shareLink = nanoid(10);
    content.shareLink = shareLink;
    await content.save();
    return res.status(200).json({ shareLink });
  } catch {
    return res.status(500).json({ error: "Could not genearte shareable link" });
  }
};
// ACCESS CONTENT USING THE SHAREABLE LINK CREATED
//
//
//
//
//
//
//
//
//
//
//
//
//
//
export const userAccessSharedContent = async (req: Request, res: Response) => {
  console.log("Share link:", req.params.shareLink);

  try {
    const content = await Content.findOne({
      shareLink: req.params.shareLink,
    });
    if (!content) {
      return res.status(200).json({ error: " Shared Content not found" });
    }
    return res.status(200).json({ content });
  } catch {
    return res.status(500).json({ error: "Could not fetch shared Content" });
  }
};
