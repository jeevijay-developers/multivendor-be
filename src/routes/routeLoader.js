const express = require("express");
//////////////// admin routes //////////////////////
const adminAttributeRoutes = require("./admin/attribute");
const adminBrandRoutes = require("./admin/brand");
const adminCampaignRoutes = require("./admin/campaign");
const adminCategoryRoutes = require("./admin/category");
const adminChildCategoryRoutes = require("./admin/child-category");
const adminCouponCodeRoutes = require("./admin/coupon-code");
const adminCurrencyRoutes = require("./admin/currency");
const adminDashboardRoutes = require("./admin/dashboard");
const adminNewsletterRoutes = require("./admin/newsletter");
const adminProductRoutes = require("./admin/product");
const adminRoutes = require("./admin/user");
const adminShopRoutes = require("./admin/shop");
const adminReviewRoutes = require("./admin/review");
const adminPaymentRoutes = require("./admin/payment");
const adminSubCategoryRoutes = require("./admin/sub-category");
const adminGeneralSettingRoutes = require("./admin/general-setting");

const adminOrderRoutes = require("./admin/order");
//////////////// user routes ///////////////////////
const userAttributeRoutes = require("./user/attribute");
const authRoutes = require("./user/auth");
const homeRoutes = require("./user/home");
const userBrandRoutes = require("./user/brand");
const userCampaignRoutes = require("./user/campaign");
const userCategoryRoutes = require("./user/category");
const userChildCategoryRoutes = require("./user/child-category");
const userCouponCodeRoutes = require("./user/coupon-code");
const userCurrencyRoutes = require("./user/currency");
const delete_fileRoutes = require("./user/file-delete");
const userNewsletterRoutes = require("./user/newsletter");
const searchRoutes = require("./user/search");
const payment = require("./user/payment-intents");
const userProductRoutes = require("./user/product");
const userRoutes = require("./user/user");
const wishlistRoutes = require("./user/wishlist");
const userShopRoutes = require("./user/shop");
const userReviewRoutes = require("./user/review");
const userSubCategoryRoutes = require("./user/sub-category");
const generalSettingsSectionRoutes = require("./user/general-settings-section");
const userGeneralSettingRoutes = require("./user/general-setting");

const userOrderRoutes = require("./user/order");
// const uploadFileRoutes = require("./user/upload");
/////////////// vendor routes //////////////////////
const vendorDashboardRoutes = require("./vendor/dashboard");
const vendorProductRoutes = require("./vendor/product");
const vendorShopRoutes = require("./vendor/shop");
const vendorPaymentRoutes = require("./vendor/payment");
const vendorOrderRoutes = require("./vendor/order");
const CourierRoutes = require("./vendor/courier");

const router = express.Router();

//////////////// admin routes //////////////////////
router.use("/api", adminAttributeRoutes);
router.use("/api", adminBrandRoutes);
router.use("/api", adminCampaignRoutes);
router.use("/api", adminCategoryRoutes);
router.use("/api", adminChildCategoryRoutes);
router.use("/api", adminCouponCodeRoutes);
router.use("/api", adminCurrencyRoutes);
router.use("/api", adminDashboardRoutes);
router.use("/api", adminNewsletterRoutes);
router.use("/api", adminProductRoutes);
router.use("/api", adminRoutes);
router.use("/api", adminShopRoutes);
router.use("/api", adminReviewRoutes);
router.use("/api", adminPaymentRoutes);
router.use("/api", adminSubCategoryRoutes);
router.use("/api", adminGeneralSettingRoutes);
router.use("/api", adminOrderRoutes);

//////////////// user routes ///////////////////////
router.use("/api", userAttributeRoutes);
router.use("/api", authRoutes);
router.use("/api", homeRoutes);
router.use("/api", userBrandRoutes);
router.use("/api", userCampaignRoutes);
router.use("/api", userCategoryRoutes);
router.use("/api", userChildCategoryRoutes);
router.use("/api", userCouponCodeRoutes);
router.use("/api", userCurrencyRoutes);
router.use("/api", userNewsletterRoutes);
router.use("/api", delete_fileRoutes);
router.use("/api", searchRoutes);
router.use("/api", payment);
router.use("/api", userProductRoutes);
router.use("/api", userRoutes);
router.use("/api", wishlistRoutes);
router.use("/api", userShopRoutes);
router.use("/api", userReviewRoutes);
router.use("/api", userSubCategoryRoutes);
router.use("/api", generalSettingsSectionRoutes);
router.use("/api", userGeneralSettingRoutes);
router.use("/api", userOrderRoutes);

// router.use("/api", uploadFileRoutes);
/////////////// vendor routes //////////////////////
router.use("/api", vendorDashboardRoutes);
router.use("/api", vendorProductRoutes);
router.use("/api", vendorShopRoutes);
router.use("/api", vendorPaymentRoutes);
router.use("/api", vendorOrderRoutes);
router.use("/api", CourierRoutes);

module.exports = router;
