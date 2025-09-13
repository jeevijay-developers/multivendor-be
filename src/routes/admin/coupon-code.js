const express = require("express");
const router = express.Router();
const couponCode = require("../../controllers/admin/coupon-code");
const verifyToken = require("../../config/jwt");

// Admin routes
router.get(
  "/admin/coupon-codes",
  verifyToken,
  couponCode.getCouponCodesByAdmin
);
router.post(
  "/admin/coupon-codes",
  verifyToken,
  couponCode.createCouponCodeByAdmin
);
router.get(
  "/admin/coupon-codes/:id",
  verifyToken,
  couponCode.getOneCouponCodeByAdmin
);
router.put(
  "/admin/coupon-codes/:id",
  verifyToken,
  couponCode.updatedCouponCodeByAdmin
);
router.delete(
  "/admin/coupon-codes/:id",
  verifyToken,
  couponCode.deleteCouponCodeByAdmin
);

module.exports = router;
