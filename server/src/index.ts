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

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

// Middleware
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Explicitly allow methods
    allowedHeaders: ["Content-Type", "Authorization"], // Explicitly allow headers
    credentials: true, // If you need cookies/sessions
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
