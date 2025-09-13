const Shop = require("../../models/Shop");
const User = require("../../models/User");
const Product = require("../../models/Product");
const Orders = require("../../models/Order");
const Payment = require("../../models/Payment");
const Review = require("../../models/Review");
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
async function calculateShopRating(shopId) {
  // Find all products of this shop
  const products = await Product.find({ shop: shopId }).select("_id");
  const productIds = products.map((p) => p._id);

  // Aggregate reviews
  const result = await Review.aggregate([
    { $match: { product: { $in: productIds } } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    rating: result.length > 0 ? result[0].avgRating : 0,
    ratingCount: result.length > 0 ? result[0].count : 0,
  };
}
const getAllShopsByAdmin = async (req, res) => {
  try {
    const shops = await Shop.find({}).select(["name", "slug", "_id"]);
    return res.status(200).json({
      success: true,
      data: shops,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/*    🏪 Get All Shops (Admin)    */
const getShopsByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { limit = 10, page = 1, search = "", status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {
      name: { $regex: search, $options: "i" },
    };

    // ✅ Add status filter only if provided
    if (status) {
      query.status = status;
    }

    const totalShop = await Shop.countDocuments(query);

    const shops = await Shop.find(query, null, {
      skip: skip,
      limit: parseInt(limit),
    })
      .select([
        "vendor",
        "logo",
        "slug",
        "status",
        "products",
        "name",
        "approvedAt",
        "approved",
      ])
      .populate({
        path: "vendor",
        select: ["firstName", "lastName", "cover"],
      })

      .sort({
        createdAt: -1,
      });
    // ✅ Add rating for each shop
    for (let shop of shops) {
      const { rating, ratingCount } = await calculateShopRating(shop._id);
      shop.rating = rating;
      shop.ratingCount = ratingCount;
    }
    return res.status(200).json({
      success: true,
      data: shops,
      count: Math.ceil(totalShop / limit),
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*    🏪 Get One Shop by ID (Admin)    */
const getOneShopByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { slug } = req.params;
    const shop = await Shop.findOne({ slug: slug });
    if (!shop) {
      return res.status(404).json({ message: "Shop Not Found" });
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

/*    🛠️ Update One Shop by ID (Admin)    */
const updateOneShopByAdmin = async (req, res) => {
  try {
    const { slug } = req.params;
    await getAdmin(req, res);
    const shop = await Shop.findOne({ slug });

    // Check if the shop exists
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });
    }

    const { status, ...others } = req.body;

    const updateShop = await Shop.findOneAndUpdate(
      {
        slug: slug,
      },
      {
        ...others,

        status: status,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    // Find the vendor associated with the updated shop
    const vendor = await User.findById(updateShop.vendor);

    // Email message
    let message;
    if (status === "approved") {
      message = "Your shop is now approved.";
    } else {
      message = "Your shop is not approved.";
    }

    // Create nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.RECEIVING_EMAIL, // Your Gmail email
        pass: process.env.EMAIL_PASSWORD, // Your Gmail password
      },
    });

    // Email options
    let mailOptions = {
      from: process.env.RECEIVING_EMAIL, // Your Gmail email
      to: vendor.email, // User's email
      subject: "Shop Status Update", // Email subject
      text: message, // Email body
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Updated Shop" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*    🔄 Update Shop Status by ID (Admin)    */
const updateShopStatusByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { sid } = req.params;
    const { status } = req.body;
    const updateStatus = await Shop.findOneAndUpdate(
      {
        _id: sid,
      },
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      data: updateStatus,
      message: "Updated Status",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/*    🗑️ Delete One Shop by ID (Admin)    */
const deleteOneShopByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const admin = await getAdmin(req, res);
    const { slug } = req.params;
    const shop = await Shop.findOne({ slug, vendor: admin._id });
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop Not Found" });
    }

    await singleFilesDelete(shop.logo._id);
    // const dataaa = await singleFileDelete(shop?.logo?._id,shop?.cover?._id);
    await Shop.deleteOne({ slug }); // Corrected to pass an object to deleteOne method
    return res.status(204).json({
      success: true,
      message: "Shop Deleted Successfully", // Corrected message typo
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getShopsByAdmin,
  getOneShopByAdmin,
  updateOneShopByAdmin,
  updateShopStatusByAdmin,
  deleteOneShopByAdmin,
  getAllShopsByAdmin,
};
