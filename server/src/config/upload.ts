import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";
import { Request } from "express";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    return {
      folder: "profile_pics", // ✅ folder in Cloudinary
      format: file.mimetype.split("/")[1] as "jpg" | "jpeg" | "png", // derive format from mimetype
      allowed_formats: ["jpg", "jpeg", "png"], // restrict formats
    };
  },
});

const upload = multer({ storage });

export default upload;
