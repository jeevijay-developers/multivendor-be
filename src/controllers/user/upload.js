const {
  singleFileUploader,
  multiFileUploader,
} = require("../../config/uploader");

const uploadSingleImage = async (req, res) => {
  try {
    // Make sure file exists
    if (!req.file || !req.file.path) {
      return res
        .status(400)
        .json({ success: false, message: "No file provided." });
    }

    // Upload to Cloudinary
    const uploadedImage = await singleFileUploader(req.file.path);

    // Respond with the image info
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      data: uploadedImage,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Image upload failed.",
      error: error.message,
    });
  }
};
// Multiple Files Upload Controller
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files provided." });
    }

    // Extract file paths from uploaded files
    const imagePaths = req.files.map((file) => file.path);

    const uploadedImages = await multiFileUploader(imagePaths);

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully.",
      data: uploadedImages,
    });
  } catch (error) {
    console.error("Multiple image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Multiple image upload failed.",
      error: error.message,
    });
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
};
