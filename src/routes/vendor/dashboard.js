const express = require("express");
const router = express.Router();

const dashboard = require("../../controllers/vendor/dashboard");
const verifyToken = require("../../config/jwt");

// Vendor Routes
router.get(
  "/vendor/dashboard-analytics",
  verifyToken,
  dashboard.getVendorAnalytics
);
router.get(
  "/vendor/low-stock-products",
  verifyToken,
  dashboard.getVendorLowStockProducts
);

module.exports = router;
