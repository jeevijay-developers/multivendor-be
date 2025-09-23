const express = require("express");
const router = express.Router();
const shop = require("../../controllers/vendor/shop");
const multer = require("multer");
const userShop = require("../../controllers/user/shop");
// Import verifyToken function
const verifyToken = require("../../config/jwt");

// Configure multer for multiple file uploads
const upload = multer({ dest: "uploads/" }); // Temporary storage

// Multi-field file upload configuration for shop creation/update
const shopFileFields = [
  { name: 'logo', maxCount: 1 },
  { name: 'governmentId', maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 },
  { name: 'vendorAgreement', maxCount: 1 },
  { name: 'letterOfAuthority', maxCount: 1 },
  { name: 'aadharCardFront', maxCount: 1 },
  { name: 'aadharCardBack', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'cancelCheque', maxCount: 1 }
];

router.post("/vendor/shops", verifyToken, upload.fields(shopFileFields), userShop.createShopByUser);
router.get("/vendor/shop/stats", verifyToken, shop.getShopStatsByVendor);
router.get("/vendor/shop", verifyToken, shop.getOneShopByVendor);
router.put("/vendor/shops/:slug", verifyToken, upload.fields(shopFileFields), shop.updateOneShopByVendor);
router.delete("/vendor/shops/:slug", verifyToken, shop.deleteOneShopByVendor);

module.exports = router;
