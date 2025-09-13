const express = require("express");
const router = express.Router();
const user = require("../../controllers/user/user");
const verifyToken = require("../../config/jwt");

// User routes
router.get("/users/profile", verifyToken, user.getOneUser);
router.put("/users/profile", verifyToken, user.updateUser);
router.get("/users/invoice", verifyToken, user.getInvoice);
router.put("/users/change-password", verifyToken, user.changePassword);

module.exports = router;
