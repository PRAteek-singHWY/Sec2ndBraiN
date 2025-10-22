// server/global.d.ts
declare module "cloudinary";
declare module "multer";
declare module "multer-storage-cloudinary";
declare module "groq-sdk";
declare module "@pinecone-database/pinecone";
declare module "youtube-transcript";
declare module "twitter-api-v2";
declare module "axios";
declare module "google-auth-library";
declare module "cors";
import "express";

declare global {
  namespace Express {
    export interface Multer {}
  }
}
