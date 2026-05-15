import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";
import type { Request } from "express";
import config from "@config";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadMedia = async (file: Request["file"], folder: string) => {
  if (!file) {
    throw new Error("No file provided");
  }

  const options: UploadApiOptions = {
    use_filename: true,
    unique_filename: true,
    overwrite: true,
    resource_type: "auto",
    folder: `legado_bolivia/${folder}`,
    allowed_formats: ["jpg", "png", "mp4", "mov", "mp3", "wav"],
    quality: "auto",
    fetch_format: "auto",
  };
  const result = await cloudinary.uploader.upload(file.path, options);
  return {
    url: result.secure_url,
    public_id: result.public_id,
    duration: result.duration,
    format: result.format,
  };
};

export const deleteMedia = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

export const generateSignedDownloadUrl = (
  url: string,
  expiresInSeconds: number = 3600
): string => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    const uploadIndex = pathParts.findIndex((p) => p === 'upload');
    if (uploadIndex === -1 || uploadIndex >= pathParts.length - 2) return url;

    const versionPart = pathParts[uploadIndex + 1];
    const publicIdParts = pathParts.slice(uploadIndex + (versionPart?.startsWith('v') ? 2 : 1));
    const fullPath = publicIdParts.join('/');

    const dotIndex = fullPath.lastIndexOf('.');
    const publicId = dotIndex !== -1 ? fullPath.slice(0, dotIndex) : fullPath;
    const format = dotIndex !== -1 ? fullPath.slice(dotIndex + 1) : '';

    const resourceType = urlObj.pathname.includes('/video/') ? 'video' : 'image';

    return cloudinary.utils.private_download_url(publicId, format, {
      resource_type: resourceType,
      type: 'upload',
      expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
      attachment: true,
    });
  } catch {
    return url;
  }
};
