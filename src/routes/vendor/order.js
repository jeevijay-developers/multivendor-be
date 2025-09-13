const express = require("express");
const router = express.Router();
const order = require("../../controllers/vendor/order");
// Import verifyToken function
const verifyToken = require("../../config/jwt");

// Vendor routes
router.get("/vendor/orders", verifyToken, order.getOrdersByVendor);
router.put("/vendor/orders/:id", verifyToken, order.updateOrderByVendor);
router.get("/vendor/orders/:id", verifyToken, order.getOrderByVendor);

module.exports = router;
