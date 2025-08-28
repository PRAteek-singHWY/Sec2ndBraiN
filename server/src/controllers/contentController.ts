import { Content, Tag, User } from "../models/db";
import mongoose from "mongoose";

import { Request, Response } from "express";
import { trim, z } from "zod";

import { nanoid } from "nanoid";
// to generate unique links
import { error } from "console";
import { type } from "os";
import { link } from "fs";

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

// it's because you're using the default Express Request type, which doesn't know about your custom userId added in the middleware.
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
    const tagIds: mongoose.Types.ObjectId[] = [];
    for (const tagTitle of tags) {
      // checking to find existing tag
      let tag = await Tag.findOne({ tagTitle });
      // if not preExisting
      if (!tag) {
        // save in database only if not already present
        tag = await Tag.create({ tagTitle });
      }
      // push anyways
      tagIds.push(tag._id);
    }

    const content = await Content.create({
      userId: req.userId,
      title: parsed.data.title,
      link: parsed.data.link,
      type: parsed.data.type,
      tags: tagIds,
      note: parsed.data.note,
    });

    // return the created doc populated so frontend can show tags immediately
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
    // update content
    if (title !== undefined) content.title = title;
    if (link !== undefined) content.link = link;
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
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const shareLink = nanoid(12); // generate unique short id
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

    // fetch all contents of that user (read-only)
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
