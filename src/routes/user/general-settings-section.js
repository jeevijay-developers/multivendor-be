const express = require("express");
const router = express.Router();
const generalSettingsSection = require("../../controllers/user/general-settings-section");

router.get("/general-settings", generalSettingsSection.getGeneralSettings);
router.get("/branding", generalSettingsSection.getBrandingSettings);
router.get("/contact-info", generalSettingsSection.getContactInfo);

module.exports = router;
