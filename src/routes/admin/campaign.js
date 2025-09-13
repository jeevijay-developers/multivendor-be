const express = require("express");
const router = express.Router();

const Campaign = require("../../controllers/admin/campaign");

// Import verifyToken function
const verifyToken = require("../../config/jwt");

router.get("/admin/campaigns", verifyToken, Campaign.getAdminCampaigns);
router.get(
  "/admin/campaigns/:slug",
  verifyToken,
  Campaign.getOneCampaignByAdmin
);

router.post("/admin/campaigns", verifyToken, Campaign.createCampaign);

router.put(
  "/admin/campaigns/:slug",
  verifyToken,
  Campaign.updateOneCampaignByAdmin
);

router.delete(
  "/admin/campaigns/:cid",
  verifyToken,
  Campaign.deleteOneCampaignByAdmin
);

module.exports = router;
