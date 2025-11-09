import axios from "axios";
import axiosInstance from "../axios";

/**
 * Media Service
 * Handles image upload using presigned URLs
 */

interface PresignedUrlResponse {
  presignedUrl: string;
  url: string;
}

/**
 * Get presigned URL for uploading an image
 */
export const getPresignedUrl = async (
  filename: string
): Promise<PresignedUrlResponse> => {
  // axiosInstance response interceptor already unwraps { data, message, statusCode }
  // So this will return { presignedUrl, url } directly
  return await axiosInstance.post("/media/presigned", { filename });
};

/**
 * Upload image file to presigned URL
 */
export const uploadToPresignedUrl = async (
  presignedUrl: string,
  file: File
): Promise<void> => {
  // Use raw axios (not axiosInstance) to upload to S3/DigitalOcean Spaces
  // because we don't want interceptors to interfere with the upload
  await axios.put(presignedUrl, file, {
    headers: {
      "x-amz-acl": "public-read",
      "Content-Type": file.type,
    },
  });
};

/**
 * Complete flow: Get presigned URL and upload file
 */
export const uploadImage = async (file: File): Promise<string> => {
  // Step 1: Get presigned URL
  const { presignedUrl, url } = await getPresignedUrl(file.name);

  // Step 2: Upload file to presigned URL
  await uploadToPresignedUrl(presignedUrl, file);

  // Step 3: Return the public URL
  return url;
};
