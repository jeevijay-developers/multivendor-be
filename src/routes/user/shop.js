const express = require("express");
const router = express.Router();
const shop = require("../../controllers/user/shop");
// Import verifyToken function
const verifyToken = require("../../config/jwt");

// User routes
router.post("/shops", verifyToken, shop.createShopByUser);
router.get("/user/shop", verifyToken, shop.getShopByUser);
router.get("/shops", shop.getShops);
router.get("/all-shops", shop.getAllShops);
router.get("/shops/:slug", shop.getOneShopByUser);
router.get("/shops-slugs", shop.getShopsSlugs);
router.get("/shop-title/:slug", shop.getShopNameBySlug);
module.exports = router;
