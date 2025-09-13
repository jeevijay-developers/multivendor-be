const Brand = require("../../models/Brand");
const Product = require("../../models/Product");
const Shop = require("../../models/Shop");
const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");
const ChildCategory = require("../../models/ChildCategory");
const Attribute = require("../../models/Attribute");
const _ = require("lodash");
const { multiFilesDelete } = require("../../config/uploader");
const { getAdmin, getVendor } = require("../../config/getUser");

/*    🛍️ Create Product by Admin    */
const createProductByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);

    const body = req.body;

    const shop = await Shop.findById(req.body.shop);

    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
    }
    if (shop.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Vendor is not approved yet",
      });
    }

    const data = await Product.create({
      ...body,
      shop: shop._id,
      likes: 0,
      status: "pending",
    });
    await Shop.findByIdAndUpdate(shop._id.toString(), {
      $addToSet: {
        products: data._id,
      },
    });
    res.status(201).json({
      success: true,
      message: "Product Created",
      data: data,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*    📦 Get All Products by Admin (Protected)    */
const getProductsByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const {
      status: statusQuery,
      page: pageQuery,
      limit: limitQuery,
      search: searchQuery,
      shop,
      category,
      brand,
    } = req.query;

    const limit = parseInt(limitQuery) || 10;
    const page = parseInt(pageQuery) || 1;

    // Calculate skip correctly
    const skip = limit * (page - 1);

    let matchQuery = {};
    if (statusQuery === "lowstock") {
      matchQuery.$or = [
        {
          $and: [{ type: "simple" }, { stockQuantity: { $lt: 30 } }],
        },
        {
          $and: [
            { type: "variable" },
            { "variants.stockQuantity": { $lt: 30 } },
          ],
        },
      ];
    } else if (Boolean(statusQuery)) {
      matchQuery.status = statusQuery;
    }
    if (shop) {
      const currentShop = await Shop.findOne({
        slug: shop,
      }).select(["slug", "_id"]);

      matchQuery.shop = currentShop._id;
    }
    if (category) {
      const currentCategory = await Category.findOne({
        slug: category,
      }).select(["slug", "_id"]);

      matchQuery.category = currentCategory._id;
    }
    if (brand) {
      const currentBrand = await Brand.findOne({
        slug: brand,
      }).select(["slug", "_id"]);

      matchQuery.brand = currentBrand._id;
    }

    const totalProducts = await Product.countDocuments({
      name: { $regex: searchQuery || "", $options: "i" },
      ...matchQuery,
    });

    const products = await Product.aggregate([
      {
        $match: {
          name: { $regex: searchQuery || "", $options: "i" },
          ...matchQuery,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
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
          image: { $arrayElemAt: ["$images", 0] },
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
        $project: {
          image: { url: "$image.url" },
          name: 1,
          slug: 1,
          status: 1,
          colors: 1,
          isFeatured: 1,
          discount: 1,
          likes: 1,
          salePrice: 1,
          price: 1,
          averageRating: 1,
          vendor: 1,
          shop: 1,
          stockQuantity: 1,
          createdAt: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: products,
      total: totalProducts,
      count: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*    🔍 Get Single Product by ID (Admin Protected)    */
const getOneProductByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const product = await Product.findOne({ slug: req.params.slug });
    const category = await Category.findById(product.category).select([
      "name",
      "slug",
    ]);
    const brand = await Brand.findById(product.brand).select("name");

    const getProductRatingAndReviews = () => {
      return Product.aggregate([
        {
          $match: { slug: req.params.slug },
        },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "reviews",
            as: "reviews",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            rating: { $avg: "$reviews.rating" },
            totalReviews: { $size: "$reviews" },
          },
        },
      ]);
    };

    const reviewReport = await getProductRatingAndReviews();
    return res.status(200).json({
      success: true,
      data: product,
      totalRating: reviewReport[0]?.rating,
      totalReviews: reviewReport[0]?.totalReviews,
      brand: brand,
      category: category,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/*    🛠️ Update Product by ID (Admin Protected)    */
const updateProductByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { slug } = req.params;

    const updated = await Product.findOneAndUpdate(
      { slug: slug },
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updated,
      message: "Product Updated",
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/*    🗑️ Delete Product by ID (Admin Protected)    */
const deletedProductByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const slug = req.params.slug;
    const product = await Product.findOne({ slug: slug });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Item Not Found",
      });
    }
    // const length = product?.images?.length || 0;
    // for (let i = 0; i < length; i++) {
    //   await multiFilesDelete(product?.images[i]);
    // }
    if (product && product.images && product.images.length > 0) {
      await multiFilesDelete(product.images);
    }
    const deleteProduct = await Product.deleteOne({ slug: slug });
    if (!deleteProduct) {
      return res.status(400).json({
        success: false,
        message: "Product Deletion Failed",
      });
    }
    await Shop.findByIdAndUpdate(req.body.shop, {
      $pull: {
        products: product._id,
      },
    });
    return res.status(204).json({
      success: true,
      message: "Product Deleted ",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProductByAdmin,
  getProductsByAdmin,
  getOneProductByAdmin,
  updateProductByAdmin,
  deletedProductByAdmin,
};
