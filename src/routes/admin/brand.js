const express = require("express");
const router = express.Router();
const brand = require("../../controllers/admin/brand");

// Import verifyToken function
const verifyToken = require("../../config/jwt");

// admin routes

router.post("/admin/brands", verifyToken, brand.createBrandByAdmin);

router.get("/admin/brands", verifyToken, brand.getBrandsByAdmin);

router.get("/admin/brands/:slug", verifyToken, brand.getBrandBySlugByAdmin);

router.put("/admin/brands/:slug", verifyToken, brand.updateBrandBySlugByAdmin);

router.delete(
  "/admin/brands/:slug",
  verifyToken,
  brand.deleteBrandBySlugByAdmin
);

router.get("/admin/all-brands", brand.getAllBrandsByAdmin);

module.exports = router;
