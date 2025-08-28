import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // keep using "username" for your local-login username (lowercased)
  username: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  // for Google users we’ll store their Gmail here as well
  email: {
    type: String,
    unique: true,
    sparse: true, // allow null for local users
    lowercase: true,
    trim: true,
  },
  // optional for Google users (they don’t have local password)
  password: {
    type: String,
    required: false,
    minlength: 8,
  },
  // profile info (from Google or you can collect later)
  name: { type: String },
  profilePic: { type: String, default: null }, // store URL only

  phone: Number,
  bio: String,

  // New fields for profile sharing
  profileShareLink: { type: String, unique: true, sparse: true },
  isProfileSharingEnabled: { type: Boolean, default: false },
});

const contentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  link: { type: String, required: false },
  type: { type: String, required: true }, // ✅ plain string (no enum)
  note: { type: String, required: false },

  createdAt: { type: Date, default: Date.now },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  shareLink: { type: String, unique: true, sparse: true },
  isSharingEnabled: { type: Boolean, default: false },
});

const tagsSchema = new mongoose.Schema({
  tagTitle: { type: String, unique: true },
});

export const Content = mongoose.model("Content", contentSchema);
export const User = mongoose.model("User", userSchema);
export const Tag = mongoose.model("Tag", tagsSchema);
