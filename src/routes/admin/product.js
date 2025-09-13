const express = require("express");
const router = express.Router();

const product = require("../../controllers/admin/product");

// Import verifyToken function
const verifyToken = require("../../config/jwt");

// Admin routes
router.post("/admin/products", verifyToken, product.createProductByAdmin);
router.get("/admin/products", verifyToken, product.getProductsByAdmin);
router.get("/admin/products/:slug", verifyToken, product.getOneProductByAdmin);
router.put("/admin/products/:slug", verifyToken, product.updateProductByAdmin);
router.delete(
  "/admin/products/:slug",
  verifyToken,
  product.deletedProductByAdmin
);

module.exports = router;
