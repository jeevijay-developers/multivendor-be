const express = require("express");
const router = express.Router();
const courier = require("../../controllers/vendor/courier");
// Import verifyToken function
const verifyToken = require("../../config/jwt");

// Vendor routes
router.post(
  "/vendor/courier-info",
  verifyToken,
  courier.createCourierInfoByVendor
);
router.put(
  "/vendor/courier-info/:id",
  verifyToken,
  courier.updateCourierInfoByVendor
);

module.exports = router;
