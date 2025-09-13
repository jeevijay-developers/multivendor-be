const Campaign = require("../../models/Campaign");
const Product = require("../../models/Product");
const _ = require("lodash");
const { getVendor, getAdmin, getUser } = require("../../config/getUser");
const { singleFileDelete } = require("../../config/uploader");

/* 👤 Get all campaigns created by user */
const getCampaignsByUser = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const limitNumber = parseInt(limit);
    const pageNumber = parseInt(page);

    if (
      isNaN(limitNumber) ||
      isNaN(pageNumber) ||
      limitNumber <= 0 ||
      pageNumber <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid 'limit' or 'page' parameter (must be positive numbers).",
      });
    }

    const skip = (pageNumber - 1) * limitNumber;
    const currentDate = new Date();

    const query = { status: "active", endDate: { $gt: currentDate } };

    const totalCount = await Campaign.countDocuments(query);

    const campaigns = await Campaign.find(query)
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: campaigns,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
/* 🔗 Get campaign details by slug */
const getCampaignBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const campaign = await Campaign.findOne({ slug: slug }).populate({
      path: "products",
      populate: {
        path: "reviews", // Populate reviews for each product
        select: "rating",
      },
    });
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign Not Found" });
    }

    // Step 2: Transform products with calculated fields
    const populatedProducts = campaign.products.map((product) => {
      const averageRating =
        product.reviews && product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0;

      let stockQuantity = product.stockQuantity;
      let price = product.price;
      let salePrice = product.salePrice;

      if (
        product.type === "variable" &&
        product.variants &&
        product.variants.length > 0
      ) {
        const variantWithLeastStock = product.variants.reduce((min, v) => {
          return v.stockQuantity < min.stockQuantity ? v : min;
        });
        stockQuantity = variantWithLeastStock.stockQuantity;
        price = variantWithLeastStock.price;
        salePrice = variantWithLeastStock.salePrice;
      }

      return {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        images: product.images,
        colors: product.colors,
        type: product.type,
        discount: product.discount,
        likes: product.likes,
        price,
        salePrice,
        stockQuantity,
        averageRating,
        vendor: product.vendor,
        shop: product.shop,
        createdAt: product.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        ...campaign.toObject(),
        products: populatedProducts,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* 🏷️ Get all campaign slugs */
const getCampaignsSlugs = async (req, res) => {
  try {
    const campaigns = await Campaign.find().select(["slug"]);

    res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* 📝 Get campaign name by slug */
const getCampaignNameBySlug = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      slug: req.params.slug,
    }).select([
      "cover",
      "description",
      "name",
      "slug",
      "address",
      "phone",
      "createdAt",
    ]);

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
module.exports = {
  getCampaignsByUser,
  getCampaignBySlug,
  getCampaignsSlugs,
  getCampaignNameBySlug,
};
