const express = require("express");
const router = express.Router();
const order = require("../../controllers/admin/order");
// Import verifyToken function
const verifyToken = require("../../config/jwt");

// Admin routes
router.get("/admin/orders", verifyToken, order.getOrdersByAdmin);
router.get("/admin/orders/:id", verifyToken, order.getOneOrderByAdmin);
router.put("/admin/orders/:id", verifyToken, order.updateOrderByAdmin);
router.delete("/admin/orders/:id", verifyToken, order.deleteOrderByAdmin);

module.exports = router;
