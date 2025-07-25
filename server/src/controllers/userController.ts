import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/db";
import dotenv from "dotenv";
import { userMiddleware } from "../middleware/userMiddleware";
dotenv.config();
// SIGN UP SCHEMA
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
const userSignupSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(10, { message: "Username must be at most 10 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(20, { message: "Password must be at most 20 characters" })
    .regex(/[A-Z]/, { message: "Must include an uppercase letter" })
    .regex(/[a-z]/, { message: "Must include a lowercase letter" })
    .regex(/[0-9]/, { message: "Must include a number" })
    .regex(/[^A-Za-z0-9]/, { message: "Must include a special character" }),
});

// creating userSignUpType
type userSignUpType = z.infer<typeof userSignupSchema>;

export const userSignUp = async (
  req: Request<{}, {}, userSignUpType>,
  res: Response
) => {
  //   checking the conditions
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
      username: username,
      password: hashedPassword,
    });

    const jwtSecret = process.env.JWT_SECRET_KEY_USER;
    if (!jwtSecret) {
      throw new Error("Missing JWT_SECRET_KEY_USER in environment");
    }
    const token = jwt.sign({ userId: newUser._id }, jwtSecret, {
      expiresIn: "1h",
    });
    return res.status(200).json({
      message: "Signed up Successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// SIGN IN SCHEMA
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
const userSigninSchema = z.object({
  username: z.string().min(3, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type userSignInType = z.infer<typeof userSigninSchema>;

export const userSignIn = async (
  req: Request<{}, {}, userSignInType>,
  res: Response
) => {
  //   checking the conditions
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
    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      return res.status(403).json({ message: "Wrong email password" });
    }
    const jwtSecret = process.env.JWT_SECRET_KEY_USER;
    if (!jwtSecret) {
      throw new Error("Missing JWT_SECRET_KEY_USER in environment");
    }
    const token = jwt.sign({ userId: existingUser._id }, jwtSecret, {
      expiresIn: "1h",
    });
    return res.status(200).json({
      message: "Signed in Successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
