const express = require("express");
const router = express.Router();
const childCategory = require("../../controllers/admin/child-category");

// Import verifyToken function
const verifyToken = require("../../config/jwt");

// Admin routes
router.post(
  "/admin/child-categories",
  verifyToken,
  childCategory.createChildCategoryByAdmin
);
router.get(
  "/admin/child-categories",
  verifyToken,
  childCategory.getAllChildCategoriesByAdmin
);
router.get(
  "/admin/child-categories/:slug",
  verifyToken,
  childCategory.getChildCategoryBySlugByAdmin
);
router.put(
  "/admin/child-categories/:slug",
  verifyToken,
  childCategory.updateChildCategoryBySlugByAdmin
);
router.delete(
  "/admin/child-categories/:slug",
  verifyToken,
  childCategory.deleteChildCategoryBySlugByAdmin
);
router.get(
  "/admin/child-categories/all",
  verifyToken,
  childCategory.getChildCategoriesByAdmin
);

module.exports = router;
