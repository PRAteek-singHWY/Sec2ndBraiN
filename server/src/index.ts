import express, { Request, Response } from "express";
import cookieParser from "cookie-parser"; // <-- Import
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter";
import { string } from "zod";
import { error } from "console";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const deployedOrigin = process.env.CLIENT_URL; // e.g., 'https://sec2ndbrain-1.onrender.com'
const localOrigin = "http://localhost:5173";

const allowedOrigins = [deployedOrigin, localOrigin].filter(Boolean); // Filter out undefined if CLIENT_URL isn't set

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests) OR if origin is in allowedOrigins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    // ... other options
  })
);
app.use(express.json());
app.use(cookieParser()); // <-- Use it here
// Routes
app.use("/api/v1", userRouter);
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to SECOND_BRAIN");
});

// Connect to MongoDB

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http:/localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
