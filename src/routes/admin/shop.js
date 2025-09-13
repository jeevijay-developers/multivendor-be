const express = require("express");
const router = express.Router();

const shop = require("../../controllers/admin/shop");

// Import verifyToken function
const verifyToken = require("../../config/jwt");

// Admin routes
router.get("/admin/shops", verifyToken, shop.getShopsByAdmin);
router.get("/admin/shops/:slug", verifyToken, shop.getOneShopByAdmin);
router.put("/admin/shops/:slug", verifyToken, shop.updateOneShopByAdmin);
router.put(
  "/admin/shops/status/:slug",
  verifyToken,
  shop.updateShopStatusByAdmin
);
router.delete("/admin/shops/:slug", verifyToken, shop.deleteOneShopByAdmin);
router.get("/admin/all-shops", shop.getAllShopsByAdmin);

module.exports = router;
