const express = require("express");
const router = express.Router();
const Category = require("../../controllers/admin/category");

// Import verifyToken function
const verifyToken = require("../../config/jwt");

// Admin routes
router.post("/admin/categories", verifyToken, Category.createCategoryByAdmin);
router.get("/admin/categories", verifyToken, Category.getCategoriesByAdmin);
router.get(
  "/admin/categories/:slug",
  verifyToken,
  Category.getCategoryBySlugByAdmin
);
router.put(
  "/admin/categories/:slug",
  verifyToken,
  Category.updateCategoryBySlugByAdmin
);
router.delete(
  "/admin/categories/:slug",
  verifyToken,
  Category.deleteCategoryBySlugByAdmin
);
// router.get("/admin/categories/all", verifyToken, adminCategory.getCategories);
router.get("/admin/all-categories", Category.getCategoriesByAdmin);

module.exports = router;
