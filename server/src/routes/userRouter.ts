// import express, { Router } from "express";
import upload from "../config/upload"; // no .js

import {
  googleSignIn,
  updateUser,
  uploadProfilePhoto,
  userSignIn,
  userSignUp,
  verifyToken,
} from "../controllers/userController";
import { userMiddleware } from "../middleware/userMiddleware";
import {
  userAccessSharedContent,
  userAddContent,
  userDeleteContent,
  userGetContent,
  userRevokeProfileShare,
  userShareContent,
  userUpdateContent,
} from "../controllers/contentController";
import { Router } from "express";
import { searchAI } from "../controllers/searchAIController";

const userRouter = Router();

// token-Verification
userRouter.get("/verify-token", userMiddleware, verifyToken);

// in userRouter.ts

// Google Sign-in
userRouter.post("/google-signin", googleSignIn);

// user-SignIn
userRouter.post("/signin", userSignIn);

// user-SignUp
userRouter.post("/signup", userSignUp);

// Add new content
userRouter.post("/content", userMiddleware, userAddContent);

// Fetching all existing documents (no pagination)
userRouter.get("/content", userMiddleware, userGetContent);

// Delete a document
userRouter.delete("/content", userMiddleware, userDeleteContent);

// update a document
userRouter.put("/content", userMiddleware, userUpdateContent);

// Create a shareable link for your second brain
userRouter.post("/brain/share", userMiddleware, userShareContent);

// Fetch another user's shared brain content
userRouter.get("/brain/:shareLink", userAccessSharedContent);

// Revoke shareable link's access (make it unshareable)
userRouter.post("/profile/revoke", userMiddleware, userRevokeProfileShare);

// Updating User PROFILE
// ✅ added multer middleware to handle profilePic file
userRouter.put("/update-profile", userMiddleware, updateUser);

userRouter.post(
  "/upload-profile-pic",
  userMiddleware,
  upload.single("profilePic"),
  uploadProfilePhoto
);

// OPEN AI EMBEDDING AND VECTOR DATABASES
userRouter.post("/search-ai", searchAI);

export default userRouter;
