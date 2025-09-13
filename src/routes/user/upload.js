const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Temporary storage
const {
  uploadSingleImage,
  uploadMultipleImages,
} = require("../../controllers/user/upload");

router.post("/upload-image", upload.single("image"), uploadSingleImage);
router.post("/upload-images", upload.array("images"), uploadMultipleImages);
module.exports = router;
