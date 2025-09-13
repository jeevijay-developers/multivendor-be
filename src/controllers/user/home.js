// controllers/newsController.js
const BrandModel = require("../../models/Brand");
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Review = require("../../models/Review");
const GeneralSetting = require("../../models/GeneralSetting");
//User Functions
// 3. Get Only Home Banners and Slides
const getHomeBanners = async (req, res) => {
  try {
    const settings = await GeneralSetting.findOne().select(
      "banner1 banner2 slides"
    );

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch home banners", error });
  }
};
/* 🗂️ Get All Categories */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" })
      .select(["name", "cover", "slug", "status"])
      .limit(6)
      .sort({
        createdAt: -1,
      });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
/* ⭐ Get Top Rated Products */
const getTopRatedProducts = async (req, res) => {
  try {
    const bestSellingProduct = await Product.aggregate([
      {
        $lookup: {
          from: "reviews",
          localField: "reviews",
          foreignField: "_id",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          variantWithLeastStock: {
            $reduce: {
              input: "$variants",
              initialValue: {
                stockQuantity: Number.MAX_VALUE,
                price: null,
                salePrice: null,
              },
              in: {
                $cond: [
                  { $lt: ["$$this.stockQuantity", "$$value.stockQuantity"] },
                  {
                    stockQuantity: "$$this.stockQuantity",
                    price: "$$this.price",
                    salePrice: "$$this.salePrice",
                  },
                  "$$value",
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          stockQuantity: {
            $cond: [
              { $eq: ["$type", "variable"] },
              "$variantWithLeastStock.stockQuantity",
              "$stockQuantity",
            ],
          },
          price: {
            $cond: [
              { $eq: ["$type", "variable"] },
              "$variantWithLeastStock.price",
              "$price",
            ],
          },
          salePrice: {
            $cond: [
              { $eq: ["$type", "variable"] },
              "$variantWithLeastStock.salePrice",
              "$salePrice",
            ],
          },
        },
      },

      {
        $sort: {
          sold: -1,
        },
      },
      {
        $limit: 8,
      },
      {
        $project: {
          images: 1,
          name: 1,
          slug: 1,
          colors: 1,
          discount: 1,
          likes: 1,
          type: 1,
          salePrice: 1,
          price: 1,
          averageRating: 1,
          stockQuantity: 1,
          vendor: 1,
          shop: 1,
          createdAt: 1,
        },
      },
    ]);
    res.status(200).json({ success: true, data: bestSellingProduct });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* 🏷️ Get All Brands */
const getBrands = async (req, res) => {
  try {
    const brandsWithProductCount = await BrandModel.aggregate([
      {
        $match: { status: "active" },
      },
      {
        $lookup: {
          from: "products", // The collection name of the ProductModel
          localField: "_id",
          foreignField: "brand",
          as: "products",
        },
      },
      {
        $addFields: {
          totalProducts: { $size: "$products" },
        },
      },
      { $limit: 12 },
      {
        $project: {
          name: 1,
          logo: 1,
          slug: 1,
          status: 1,
          totalProducts: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: brandsWithProductCount });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* 🛒 Get Best Seller Products */
const getBestSellerProducts = async (req, res) => {
  try {
    const bestSellingProducts = await Product.aggregate([
      {
        $lookup: {
          from: "reviews",
          localField: "reviews",
          foreignField: "_id",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          variantWithLeastStock: {
            $reduce: {
              input: "$variants",
              initialValue: {
                stockQuantity: Number.MAX_VALUE,
                price: null,
                salePrice: null,
              },
              in: {
                $cond: [
                  { $lt: ["$$this.stockQuantity", "$$value.stockQuantity"] },
                  {
                    stockQuantity: "$$this.stockQuantity",
                    price: "$$this.price",
                    salePrice: "$$this.salePrice",
                  },
                  "$$value",
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          stockQuantity: {
            $cond: [
              { $eq: ["$type", "variable"] },
              "$variantWithLeastStock.stockQuantity",
              "$stockQuantity",
            ],
          },
          price: {
            $cond: [
              { $eq: ["$type", "variable"] },
              "$variantWithLeastStock.price",
              "$price",
            ],
          },
          salePrice: {
            $cond: [
              { $eq: ["$type", "variable"] },
              "$variantWithLeastStock.salePrice",
              "$salePrice",
            ],
          },
        },
      },

      {
        $sort: {
          sold: -1,
        },
      },
      {
        $limit: 8,
      },
      {
        $project: {
          images: 1,
          name: 1,
          slug: 1,
          colors: 1,
          discount: 1,
          likes: 1,
          type: 1,
          salePrice: 1,
          price: 1,
          averageRating: 1,
          stockQuantity: 1,
          vendor: 1,
          shop: 1,
          createdAt: 1,
        },
      },
    ]);

    return res.status(200).json({ success: true, data: bestSellingProducts });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/* ✨ Get Featured Products */
const getFeaturedProducts = async (req, res) => {
  try {
    const featured = await Product.aggregate([
      {
        $lookup: {
          from: "reviews",
          localField: "reviews",
          foreignField: "_id",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          variantWithLeastStock: {
            $reduce: {
              input: "$variants",
              initialValue: {
                stockQuantity: Number.MAX_VALUE,
                price: null,
                salePrice: null,
              },
              in: {
                $cond: [
                  { $lt: ["$$this.stockQuantity", "$$value.stockQuantity"] },
                  {
                    stockQuantity: "$$this.stockQuantity",
                    price: "$$this.price",
                    salePrice: "$$this.salePrice",
                  },
                  "$$value",
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          stockQuantity: {
            $cond: [
              { $eq: ["$type", "variable"] },
              "$variantWithLeastStock.stockQuantity",
              "$stockQuantity",
            ],
          },
          price: {
            $cond: [
              { $eq: ["$type", "variable"] },
              "$variantWithLeastStock.price",
              "$price",
            ],
          },
          salePrice: {
            $cond: [
              { $eq: ["$type", "variable"] },
              "$variantWithLeastStock.salePrice",
              "$salePrice",
            ],
          },
        },
      },

      {
        $match: {
          isFeatured: true,
        },
      },
      {
        $limit: 8,
      },
      {
        $project: {
          images: 1,
          name: 1,
          slug: 1,
          type: 1,
          discount: 1,
          likes: 1,
          salePrice: 1,
          price: 1,
          averageRating: 1,
          stockQuantity: 1,
          vendor: 1,
          shop: 1,
          createdAt: 1,
          type: 1,
        },
      },
    ]);
    return res.status(200).json({ success: true, data: featured });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* 💬 Get Featured Reviews */
const getFeaturedReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const reviews = await Review.aggregate([
      // Sort first so $first gets the highest-rated & newest
      { $sort: { rating: -1, createdAt: -1 } },

      // Group by user ID, take the first review per user
      {
        $group: {
          _id: "$user",
          review: { $first: "$$ROOT" },
        },
      },

      // Replace root with the review object
      { $replaceRoot: { newRoot: "$review" } },

      // Limit to the desired number of unique users
      { $limit: limit },
    ]).exec();

    // Populate user data after aggregation
    await Review.populate(reviews, {
      path: "user",
      select: ["firstName", "lastName", "cover", "gender", "city", "country"],
    });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  //User functions
  getHomeBanners,
  getCategories,
  getTopRatedProducts,
  getBrands,
  getBestSellerProducts,
  getFeaturedProducts,
  getFeaturedReviews,
};
