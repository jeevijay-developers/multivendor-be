const express = require("express");
const router = express.Router();
const admin = require("../../controllers/admin/admin");
const verifyToken = require("../../config/jwt");

router.get("/admin/users", verifyToken, admin.getUsersByAdmin);
router.get("/admin/users/:id", verifyToken, admin.getUserOrdersByAdmin);
router.post("/admin/users/role/:id", verifyToken, admin.updateUserRoleByAdmin);

module.exports = router;
