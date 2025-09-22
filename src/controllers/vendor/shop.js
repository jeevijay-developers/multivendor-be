const Shop = require("../../models/Shop");
const User = require("../../models/User");
const Product = require("../../models/Product");
const Orders = require("../../models/Order");
const Payment = require("../../models/Payment");
const { singleFilesDelete } = require("../../config/uploader");
const nodemailer = require("nodemailer");
const _ = require("lodash");
const { getVendor, getAdmin, getUser } = require("../../config/getUser");

async function getTotalEarningsByShopId(shopId) {
  // const result = await Payment.find({ shop: shopId });
  const pipeline = [
    {
      $match: {
        shop: shopId,
        status: "paid", // Filter by shop ID and paid status
      },
    },
    {
      $group: {
        _id: null, // Group all documents (optional, set shop ID for grouping by shop)
        totalEarnings: { $sum: "$totalIncome" }, // Calculate sum of totalIncome for paid payments
        totalCommission: { $sum: "$totalCommission" }, // Calculate sum of totalIncome for paid payments
      },
    },
  ];

  const result = await Payment.aggregate(pipeline);

  if (result.length > 0) {
    return result[0]; // Return total earnings from paid payments
  } else {
    return {
      totalEarnings: 0,
      totalCommission: 0,
    }; // Return 0 if no paid payments found for the shop
  }
}

/*    📊 Get Shop Stats by Vendor ID    */
const getShopStatsByVendor = async (req, res) => {
  try {
    await getVendor(req, res);

    const shop = await Shop.findOne({ vendor: req.user._id });
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop Not Found" });
    }
    const { totalCommission, totalEarnings } = await getTotalEarningsByShopId(
      shop._id
    );
    // stats
    const totalProducts = await Product.countDocuments({
      shop: shop._id,
    });
    const totalOrders = await Orders.countDocuments({
      "items.shop": shop._id,
    });

    return res.status(200).json({
      success: true,
      data: shop,
      totalOrders,
      totalEarnings,
      totalCommission,
      totalProducts,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/*    🏪 Create Shop by Vendor    */
const createShopByVendor = async (req, res) => {
  try {
    // Get user (could be "user" role initially, will be upgraded to "vendor")
    const user = await getUser(req, res);
    
    // Check if user already has a shop
    const existingShop = await Shop.findOne({ vendor: user._id });
    if (existingShop) {
      return res.status(400).json({
        success: false,
        message: "You already have a shop registered"
      });
    }

    const { 
      logo, 
      identityVerification,
      ownerDetails,
      financialDetails,
      ...others 
    } = req.body;
    
    // Validate required fields
    if (!logo) {
      return res.status(400).json({
        success: false,
        message: "Logo is required"
      });
    }

    if (!identityVerification?.governmentId || !identityVerification?.proofOfAddress) {
      return res.status(400).json({
        success: false,
        message: "Identity verification documents are required"
      });
    }

    if (!ownerDetails) {
      return res.status(400).json({
        success: false,
        message: "Owner details are required"
      });
    }

    const shop = await Shop.create({
      vendor: user._id.toString(),
      ...others,
      logo: {
        ...logo,
      },
      identityVerification: {
        governmentId: {
          ...identityVerification.governmentId,
        },
        proofOfAddress: {
          ...identityVerification.proofOfAddress,
        }
      },
      ownerDetails: {
        ...ownerDetails,
        aadharCard: {
          ...ownerDetails.aadharCard,
        },
        panCard: {
          ...ownerDetails.panCard,
        },
        cancelCheque: {
          ...ownerDetails.cancelCheque,
        }
      },
      ...(financialDetails && {
        financialDetails: {
          ...financialDetails,
        }
      }),
      status: "pending",
    });

    // Update user role from "user" to "vendor" and link the shop
    await User.findByIdAndUpdate(
      user._id,
      {
        role: "vendor",
        shop: shop._id,
        commission: 0 // Default commission, can be updated later by admin
      },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      data: shop,
      message: "Shop created successfully and is under review. Your account has been upgraded to vendor status.",
    });
  } catch (error) {
    console.error('Shop creation error:', error);
    return res.status(400).json({ 
      success: false, 
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

/*    🔍 Get One Shop by Vendor    */
const getOneShopByVendor = async (req, res) => {
  try {
    const vendor = await getVendor(req, res);

    const shop = await Shop.findOne({ vendor: vendor._id });
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop Not Found" });
    }
    return res.status(200).json({
      success: true,
      data: shop,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/*    ✏️ Update One Shop by Vendor    */
const updateOneShopByVendor = async (req, res) => {
  try {
    const { slug } = req.params;
    const vendor = await getVendor(req, res);
    const { logo, financialDetails, ...others } = req.body;
    // 🔒 Financial details must be present
    if (!financialDetails || !financialDetails.paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Financial details and payment method are required",
      });
    }

    // 🔒 Validate Paypal
    if (financialDetails.paymentMethod === "paypal") {
      if (!financialDetails?.paypal?.email) {
        return res.status(400).json({
          success: false,
          message: "Paypal email is required",
        });
      }
    }

    // 🔒 Validate Bank
    if (financialDetails.paymentMethod === "bank") {
      const missingFields = [];
      if (!financialDetails.bank?.accountNumber)
        missingFields.push("accountNumber");
      if (!financialDetails.bank?.bankName) missingFields.push("bankName");
      if (!financialDetails.bank?.holderName) missingFields.push("holderName");
      if (!financialDetails.bank?.holderEmail)
        missingFields.push("holderEmail");

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing bank fields: ${missingFields.join(", ")}`,
        });
      }
    }
    const updateShop = await Shop.findOneAndUpdate(
      {
        slug: slug,
        vendor: vendor._id.toString(),
      },
      {
        ...others,
        logo: {
          ...logo,
        },
        financialDetails: {
          ...financialDetails,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Updated shop",
      data: updateShop,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/*    🗑️ Delete One Shop by Vendor    */
const deleteOneShopByVendor = async (req, res) => {
  try {
    const { slug } = req.params;
    const vendor = await getVendor(req, res);
    const shop = await Shop.findOne({ slug: slug, vendor: vendor._id });
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop Not Found" });
    }
    // const dataaa = await singleFileDelete(shop?.logo?._id,shop?.cover?._id);
    await Shop.deleteOne({ _id: slug, vendor: vendor._id }); // Corrected to pass an object to deleteOne method
    return res.status(204).json({
      success: true,
      message: "Shop Deleted Successfully", // Corrected message typo
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getShopStatsByVendor,
  createShopByVendor,
  getOneShopByVendor,
  updateOneShopByVendor,
  deleteOneShopByVendor,
  getShopStatsByVendor,
};
