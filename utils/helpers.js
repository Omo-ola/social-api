const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");
const { stack } = require("../routes/posts");
const { exists } = require("../models/Post");

exports.uploadToCloudinary = async (file) => {
  try {
    console.log("Uploading file to Cloudinary:", file.originalname);

    // Check if file exists
    if (!file || !file.path) {
      throw new Error("No file provided");
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB (reduced from 10MB)
    if (file.size > maxSize) {
      throw new Error(
        `File too large. Maximum size is 5MB. Your file is ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`
      );
    }

    // Upload to Cloudinary
    const result = await Promise.race([
      cloudinary.uploader.upload(file.path, {
        folder: "social-network",
        resource_type: "auto",
        timeout: 60000, // 1 minute timeout (reduced from 2 minutes)
        chunk_size: 4000000, // 4MB chunks (optimized for 5MB max)
        transformation: [{ quality: "auto:good" }, { format: "auto" }],
      }),
      new Promise(
        (_, reject) =>
          setTimeout(
            () => reject(new Error("Cloudinary upload timeout")),
            60000
          ) // 1 minute
      ),
    ]);

    console.log("Upload successful:", result.secure_url);

    // Delete temporary file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // Clean up temporary file
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
};


exports.paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

exports.formatResponse = (data, message = "", success = true) => {
  return { success, message, data };
};

exports.deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error to delete from cloudinary " + error);
    throw error;
  }
};
