const express = require("express");
const router = express.Router();
const currency = require("../../controllers/admin/currency");
const apicache = require("apicache");
const cache = apicache.middleware;
// Import verifyToken function
const verifyToken = require("../../config/jwt");

router.get("/admin/currencies", verifyToken, currency.getAdminCurrencies);
router.get("/admin/currencies/:cid", verifyToken, currency.getCurrency);

router.post("/admin/currencies", verifyToken, currency.createCurrency);

router.put("/admin/currencies/:cid", verifyToken, currency.updateCurrency);

router.delete("/admin/currencies/:cid", verifyToken, currency.deleteCurrency);

module.exports = router;
