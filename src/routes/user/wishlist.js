const express = require("express");
const router = express.Router();
const wishlist = require("../../controllers/user/wishlist");
// Import verifyToken function
const verifyToken = require("../../config/jwt");
//user routes
router.get("/wishlist", verifyToken, wishlist.getWishlist);
router.post("/wishlist", verifyToken, wishlist.createWishlist);

module.exports = router;
