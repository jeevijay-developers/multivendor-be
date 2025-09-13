const express = require("express");
const generalSetting = require("../../controllers/user/general-setting");
const router = express.Router();

router.get("/settings/general-settings", generalSetting.getUserSettings);

module.exports = router;
