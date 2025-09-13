const express = require("express");
const router = express.Router();

const order = require("../../controllers/user/order");

router.post("/orders", order.createOrder);
router.get("/orders/:id", order.getOrderById);

module.exports = router;
