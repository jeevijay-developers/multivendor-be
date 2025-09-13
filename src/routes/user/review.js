const express = require("express");
const router = express.Router();
const review = require("../../controllers/user/review");
// Import verifyToken function
const verifyToken = require("../../config/jwt");

// User routes
router.get("/reviews/:pid", review.getReviewsbyPid);
router.post("/reviews", verifyToken, review.createReview);

module.exports = router;
