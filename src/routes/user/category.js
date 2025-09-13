const express = require("express");
const router = express.Router();
const Category = require("../../controllers/user/category");

// Import verifyToken function
const verifyToken = require("../../config/jwt");

router.get("/categories", Category.getCategories);
router.get("/header/all-categories", Category.getAllHeaderCategories);
router.get("/all-categories", Category.getAllCategories);
router.get("/categories-slugs", Category.getCategoriesSlugs);
router.get("/categories/:slug", Category.getCategoryBySlug);

module.exports = router;
