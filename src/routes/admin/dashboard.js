const express = require("express");
const router = express.Router();
const dashboard = require("../../controllers/admin/dashboard");
const verifyToken = require("../../config/jwt");

// Admin Routes
router.get(
  "/admin/dashboard-analytics",
  verifyToken,
  dashboard.getDashboardAnalyticsByAdmin
);
router.get(
  "/admin/low-stock-products",
  verifyToken,
  dashboard.getAdminLowStockProductsByAdmin
);
router.get(
  "/admin/notifications",
  verifyToken,
  dashboard.getNotificationsByAdmin
);

module.exports = router;
