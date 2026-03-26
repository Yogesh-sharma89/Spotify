import cloudinary from "../config/cloudinary";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
  resourceType: "image" | "video" | "auto" = "auto"
): Promise<CloudinaryUploadResult> => {

  if (!file.buffer) {
    throw new Error("File buffer is empty");
  }

  const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: resourceType,
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
};