const express = require("express");
const router = express.Router();
const notification = require("../../controllers/admin/notification");
// Import verifyToken function
const verifyToken = require("../../config/jwt");

//admin routes
router.get(
  "/admin/notifications",
  verifyToken,
  notification.getNotificationsByAdmin
);
router.post(
  "/admin/notifications",
  verifyToken,
  notification.createNotificationByAdmin
);

module.exports = router;
