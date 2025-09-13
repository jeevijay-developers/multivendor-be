const express = require("express");
const router = express.Router();

const newsletter = require("../../controllers/admin/newsletter");

// Import verifyToken function
const verifyToken = require("../../config/jwt");
// Admin routes
router.get("/admin/newsletter", verifyToken, newsletter.getNewslettersByAdmin);

module.exports = router;
