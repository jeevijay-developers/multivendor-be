const express = require("express");
const router = express.Router();
const Campaign = require("../../controllers/user/campaign");

router.get("/campaigns", Campaign.getCampaignsByUser);
router.get("/campaigns/:slug", Campaign.getCampaignBySlug);
router.get("/campaigns-slugs", Campaign.getCampaignsSlugs);
router.get("/campaign-title/:slug", Campaign.getCampaignNameBySlug);

module.exports = router;
