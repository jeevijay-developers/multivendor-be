const express = require("express");
const router = express.Router();
const subCategory = require("../../controllers/admin/sub-category");

// Import verifyToken function
const verifyToken = require("../../config/jwt");

router.post(
  "/admin/sub-categories",
  verifyToken,
  subCategory.createSubCategoryByAdmin
);
router.get(
  "/admin/sub-categories",
  verifyToken,
  subCategory.getSubCategoriesByAdmin
);
router.get(
  "/admin/sub-categories/:slug",
  verifyToken,
  subCategory.getSubCategoryBySlugByAdmin
);
router.put(
  "/admin/sub-categories/:slug",
  verifyToken,
  subCategory.updateSubCategoryBySlugByAdmin
);
router.delete(
  "/admin/sub-categories/:slug",
  verifyToken,
  subCategory.deleteSubCategoryBySlugByAdmin
);
router.get("/admin/sub-categories/all", subCategory.getAllSubCategoriesByAdmin);

module.exports = router;
