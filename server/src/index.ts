import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const deployedOrigin = process.env.CLIENT_URL;
const localOrigin = "http://localhost:5173";

const allowedOrigins = [deployedOrigin, localOrigin].filter(Boolean);

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1", userRouter);

// ---------------------------------------------------------------------------
//  FIX: SERVING FRONTEND
// ---------------------------------------------------------------------------

// Resolve path to the client build folder
const clientBuildPath = path.join(__dirname, "../../client/dist");

// 1. Serve static files (JS, CSS, Images)
app.use(express.static(clientBuildPath));

// 2. THE FIX: Catch-All Route using Regex Object
// Passing /.*/ directly (no quotes) avoids "PathError: Missing parameter name"
app.get(/.*/, (req: Request, res: Response) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// ---------------------------------------------------------------------------

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
