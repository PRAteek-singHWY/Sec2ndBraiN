// middleware
// debugger.ts
// run mongoDB
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface JwtPayload {
  userId: string;
}

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const userMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = (req.headers.token ||
    req.headers.authorization?.split(" ")[1]) as string;

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY_USER as string
    ) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(403).json({
      message: "You are not signed in",
    });
  }
};
