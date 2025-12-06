import express, { Request, Response, NextFunction } from "express";
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

// 1. CORS Middleware
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

// 2. Body & Cookie Parsers
app.use(express.json());
app.use(cookieParser());

// 3. FIX: Google Login & Security Headers
// This solves the "Cross-Origin-Opener-Policy policy would block..." error
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// 4. API Routes (MUST be before static files)
app.use("/api/v1", userRouter);

// ---------------------------------------------------------------------------
//  SERVING FRONTEND (DEPLOYMENT FIX)
// ---------------------------------------------------------------------------

// Resolve path to the client build folder
// Note: Ensure your Render Build Command builds the client first!
const clientBuildPath = path.join(__dirname, "../../client/dist");

// 5. Serve static files (JS, CSS, Images)
app.use(express.static(clientBuildPath));

// 6. Catch-All Route (SPA Support)
// We use a Regex /.*/ to avoid the "Missing parameter name" crash in newer Express versions
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
