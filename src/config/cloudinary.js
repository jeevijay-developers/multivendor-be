const cloudinary = require("cloudinary").v2;
require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_PUBLISHABLE_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
  secure: true,
});

module.exports = cloudinary;
