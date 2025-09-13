const express = require("express");
const router = express.Router();
const shop = require("../../controllers/vendor/shop");
// Import verifyToken function
const verifyToken = require("../../config/jwt");

router.post("/vendor/shops", verifyToken, shop.createShopByVendor);
router.get("/vendor/shop/stats", verifyToken, shop.getShopStatsByVendor);
router.get("/vendor/shop", verifyToken, shop.getOneShopByVendor);
router.put("/vendor/shops/:slug", verifyToken, shop.updateOneShopByVendor);
router.delete("/vendor/shops/:slug", verifyToken, shop.deleteOneShopByVendor);

module.exports = router;
