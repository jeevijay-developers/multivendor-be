const express = require("express");
const router = express.Router();
const payment = require("../../controllers/vendor/payment");

// Import verifyToken function
const verifyToken = require("../../config/jwt");

// Vendor routes
router.get("/vendor/shops/income", verifyToken, payment.getIncomeByVendor);
router.get("/vendor/payments", verifyToken, payment.getPaymentsByVendor);
router.get(
  "/vendor/payments/:pid",
  verifyToken,
  payment.getPaymentDetailsByIdByVendor
);

module.exports = router;
