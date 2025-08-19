import express, { Router } from "express";
import {
  googleSignIn,
  userSignIn,
  userSignUp,
} from "../controllers/userController";
import { userMiddleware } from "../middleware/userMiddleware";
import {
  userAccessSharedContent,
  userAddContent,
  userDeleteContent,
  userGetContent,
  userShareContent,
  userUpdateContent,
} from "../controllers/contentController";
const userRouter = Router();
// in userRouter.ts
userRouter.get("/verify-token", userMiddleware, (req, res) => {
  return res.status(200).json({ loggedIn: true });
});

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

export default userRouter;
