import { v2 as cloudinary } from "cloudinary";

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  const missing: string[] = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!process.env.CLOUDINARY_API_KEY) missing.push("CLOUDINARY_API_KEY");
  if (!process.env.CLOUDINARY_API_SECRET) missing.push("CLOUDINARY_API_SECRET");
  console.warn(`[CONFIG ERROR] Cloudinary credentials are missing in server/.env: ${missing.join(", ")}. Uploads will run in mock mode.`);
}

export const uploadImage = async (
  file: string,
  folder: string = "rv-foods/products"
): Promise<{ url: string; publicId: string }> => {
  if (!isConfigured) {
    const missing: string[] = [];
    if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push("CLOUDINARY_CLOUD_NAME");
    if (!process.env.CLOUDINARY_API_KEY) missing.push("CLOUDINARY_API_KEY");
    if (!process.env.CLOUDINARY_API_SECRET) missing.push("CLOUDINARY_API_SECRET");
    console.error(`[CONFIG ERROR] Image upload requested, but Cloudinary is not configured. Missing: ${missing.join(", ")}`);
    console.log("Cloudinary is running in mock mode. Returning mock image details...");
    
    const placeholders = [
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800&auto=format&fit=crop&q=80",
    ];
    const mockUrl = placeholders[Math.floor(Math.random() * placeholders.length)];
    return {
      url: mockUrl,
      publicId: `mock_public_id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: "fill" },
        { quality: "auto" },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    console.error(`[CLOUDINARY ERROR] Image upload failed: ${error.message}`);
    if (process.env.NODE_ENV !== "production") {
      console.error(error.stack);
    }
    throw new Error("Failed to upload image");
  }
};

export const deleteImage = async (publicId: string): Promise<void> => {
  if (!isConfigured) {
    console.log(`Cloudinary is running in mock mode. Skipping deletion of publicId: ${publicId}`);
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    console.error(`[CLOUDINARY ERROR] Image deletion failed for publicId ${publicId}: ${error.message}`);
    if (process.env.NODE_ENV !== "production") {
      console.error(error.stack);
    }
    throw new Error("Failed to delete image");
  }
};

export const uploadMultipleImages = async (
  files: string[],
  folder: string = "rv-foods/products"
): Promise<{ url: string; publicId: string }[]> => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error: any) {
    console.error(`[CLOUDINARY ERROR] Multiple images upload failed: ${error.message}`);
    if (process.env.NODE_ENV !== "production") {
      console.error(error.stack);
    }
    throw error;
  }
};

export default cloudinary;
