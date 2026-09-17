import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Verify that a file with the given publicId actually exists in Cloudinary.
 * Called before saving any certification record to the database.
 * Prevents spoofed publicIds submitted by malicious clients.
 *
 * @returns true if the resource exists
 * @throws Error if the resource does not exist or the API call fails
 */
export const verifyUpload = async (publicId: string): Promise<boolean> => {
  try {
    await cloudinary.api.resource(publicId);
    return true;
  } catch (err: any) {
    // Cloudinary throws a 404-style error when the resource does not exist
    if (err?.http_code === 404 || err?.error?.http_code === 404) {
      throw new Error("Certificate verification failed — file not found in storage");
    }
    // For config issues (missing env vars), re-throw but log clearly
    console.error("[cloudinaryService] verifyUpload error:", err?.message ?? err);
    throw new Error("Certificate verification failed — storage service error");
  }
};

export default cloudinary;
