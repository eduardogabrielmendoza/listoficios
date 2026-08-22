import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

let configured = false;

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) throw new Error("CLOUDINARY_NOT_CONFIGURED");

  if (!configured) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    configured = true;
  }

  return cloudinary;
}

export type StoredImage = {
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
};

export async function uploadImage(body: Buffer, folder: string): Promise<StoredImage> {
  const sdk = configureCloudinary();
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = sdk.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        public_id: crypto.randomUUID(),
        overwrite: false,
        unique_filename: false,
      },
      (error, response) => {
        if (error || !response) reject(error ?? new Error("CLOUDINARY_UPLOAD_FAILED"));
        else resolve(response);
      },
    );
    stream.end(body);
  });

  return {
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format,
  };
}

export async function deleteImage(publicId: string) {
  const sdk = configureCloudinary();
  const result = await sdk.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
  if (result.result !== "ok" && result.result !== "not found") throw new Error("CLOUDINARY_DELETE_FAILED");
}

export function getImageUrl(publicId: string) {
  return configureCloudinary().url(publicId, {
    secure: true,
    fetch_format: "auto",
    quality: "auto",
  });
}
