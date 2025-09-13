const express = require("express");
const router = express.Router();
const review = require("../../controllers/admin/review");
// Import verifyToken function
const verifyToken = require("../../config/jwt");

// Admin routes
router.get("/admin/reviews", verifyToken, review.getReviewsByAdmin);
router.post("/admin/review", verifyToken, review.createReviewByAdmin);

module.exports = router;
