const express = require("express");
const router = express.Router();
const paymentIntents = require("../../controllers/user/payment-intents");
//User route
router.post("/payment-intents", paymentIntents.createPaymentIntent);

module.exports = router;
