import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/db";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// -------- Local Sign Up --------
const userSignupSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(70, { message: "Username must be at most 70 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(70, { message: "Password must be at most 70 characters" })
    .regex(/[A-Z]/, { message: "Must include an uppercase letter" })
    .regex(/[a-z]/, { message: "Must include a lowercase letter" })
    .regex(/[0-9]/, { message: "Must include a number" })
    .regex(/[^A-Za-z0-9]/, { message: "Must include a special character" }),
});

type userSignUpType = z.infer<typeof userSignupSchema>;

export const userSignUp = async (
  req: Request<{}, {}, userSignUpType>,
  res: Response
) => {
  const parsed = userSignupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(411).json({
      message: "Input validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { username, password } = parsed.data;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(403)
        .json({ message: "User with this name already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
    });

    const jwtSecret = process.env.JWT_SECRET_KEY_USER!;
    const token = jwt.sign({ userId: newUser._id }, jwtSecret, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "Signed up Successfully",
      token,
      user: {
        username: newUser.username,
        email: newUser.email ?? null,
        name: newUser.name ?? null,
        profilePic: newUser.profilePic ?? null,
      },
    });
  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// -------- Local Sign In --------
const userSigninSchema = z.object({
  username: z.string().min(3, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type userSignInType = z.infer<typeof userSigninSchema>;

export const userSignIn = async (
  req: Request<{}, {}, userSignInType>,
  res: Response
) => {
  const parsed = userSigninSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(411).json({
      message: "Input validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { username, password } = parsed.data;

  try {
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(403).json({ message: "No such user exists" });
    }

    if (!existingUser.password) {
      return res
        .status(403)
        .json({ message: "Use Google login for this user" });
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return res.status(403).json({ message: "Wrong email password" });
    }

    const jwtSecret = process.env.JWT_SECRET_KEY_USER!;
    const token = jwt.sign({ userId: existingUser._id }, jwtSecret, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "Signed in Successfully",
      token,
      user: {
        username: existingUser.username,
        email: existingUser.email ?? null,
        name: existingUser.name ?? null,
        profilePic: existingUser.profilePic ?? null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// -------- Google Sign In --------
export const googleSignIn = async (req: Request, res: Response) => {
  const idToken = req.body.idToken as string;
  if (!idToken) return res.status(400).json({ message: "idToken missing" });

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload?.email?.toLowerCase();
    const name = payload?.name || "";
    const picture = payload?.picture || "";

    if (!email) return res.status(400).json({ message: "No email found" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        username: email, // use email as username for Google users
        name,
        profilePic: picture,
        // password omitted (google-only account)
      });
    } else {
      // keep profile fresh
      user.name = user.name || name;
      user.profilePic = user.profilePic || picture;
      await user.save();
    }

    const jwtSecret = process.env.JWT_SECRET_KEY_USER!;
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "Google sign-in successful",
      token,
      user: {
        username: user.username,
        email: user.email ?? null,
        name: user.name ?? null,
        profilePic: user.profilePic ?? null,
      },
    });
  } catch (err) {
    console.error("Google sign-in error:", err);
    return res.status(401).json({ message: "Invalid Google token" });
  }
};
