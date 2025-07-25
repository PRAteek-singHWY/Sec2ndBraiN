import express, { Router } from "express";
import { userSignIn, userSignUp } from "../controllers/userController";
import { userMiddleware } from "../middleware/userMiddleware";
import {
  userAccessSharedContent,
  userAddContent,
  userDeleteContent,
  userGetContent,
  userShareContent,
} from "../controllers/contentController";
const userRouter = Router();

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

// Create a shareable link for your second brain
userRouter.post("/brain/share", userMiddleware, userShareContent);

// Fetch another user's shared brain content
userRouter.get("/brain/:shareLink", userAccessSharedContent);

export default userRouter;
