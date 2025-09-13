const express = require("express");
const generalSetting = require("../../controllers/admin/general-setting");
const verifyToken = require("../../config/jwt");
const router = express.Router();

router.get(
  "/admin/settings/general-settings",
  verifyToken,
  generalSetting.getSettings
);

router.post(
  "/admin/settings/general-settings",
  verifyToken,
  generalSetting.createGeneralSettings
);

module.exports = router;
