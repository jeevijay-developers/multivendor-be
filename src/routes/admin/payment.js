const express = require("express");
const router = express.Router();
const payment = require("../../controllers/admin/payment");

// Import verifyToken function
const verifyToken = require("../../config/jwt");

// Admin routes
router.post("/admin/payments", verifyToken, payment.createPaymentByAdmin);
router.get("/admin/payments", verifyToken, payment.getPaymentsByAdmin);
router.get(
  "/admin/payments/:pid",
  verifyToken,
  payment.getPaymentDetailsByIdByAdmin
);
router.get(
  "/admin/shops/:slug/income",
  verifyToken,
  payment.getIncomeByShopByAdmin
);
router.put("/admin/payments/:id", verifyToken, payment.updatePaymentByAdmin);
router.put(
  "/admin/payments/:pid/status",
  verifyToken,
  payment.updatePaymentStatusByAdmin
);

router.delete("/admin/payments/:id", verifyToken, payment.deletePaymentByAdmin);
router.get("/admin/payouts", verifyToken, payment.getPayoutsByAdmin);

module.exports = router;
