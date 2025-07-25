import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
});

const contentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  shareLink: { type: String, unique: true, sparse: true }, // optional field
});

export const Content = mongoose.model("Content", contentSchema);
export const User = mongoose.model("User", userSchema);
