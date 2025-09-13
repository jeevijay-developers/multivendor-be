const express = require("express");
const router = express.Router();
const product = require("../../controllers/vendor/vendor-product");

// Import verifyToken function
const verifyToken = require("../../config/jwt");

router.post("/vendor/products", verifyToken, product.createProductByVendor);
router.get("/vendor/products", verifyToken, product.getProductsByVendor);
router.get("/vendor/products/:slug", verifyToken, product.getOneProductVendor);
router.put(
  "/vendor/products/:slug",
  verifyToken,
  product.updateProductByVendor
);
router.delete(
  "/vendor/products/:slug",
  verifyToken,
  product.deleteProductByVendor
);

module.exports = router;
