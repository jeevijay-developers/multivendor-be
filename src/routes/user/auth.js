const express = require("express");
const router = express.Router();
const authController = require("../../controllers/user/auth");
const verifyToken = require("../../config/jwt");

router.post("/auth/sign-up", authController.signUp);
router.post("/auth/sign-in", authController.signIn);
router.post("/auth/forget-password", authController.forgetPassword);
router.post("/auth/reset-password", authController.resetPassword);
router.post("/auth/verify-otp", verifyToken, authController.verifyOtp);
router.post("/auth/resend-otp", verifyToken, authController.resendOtp);

module.exports = router;
