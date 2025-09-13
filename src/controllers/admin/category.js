const User = require("../../models/User");
const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");
const ChildCategory = require("../../models/ChildCategory");
const Product = require("../../models/Product");
const { singleFileDelete } = require("../../config/uploader");
const { getAdmin } = require("../../config/getUser");

// Admin Routes
// ✅ Create Category by Admin
const createCategoryByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { cover, ...others } = req.body;
    await Category.create({
      ...others,
      cover: {
        ...cover,
      },
    });

    res.status(201).json({ success: true, message: "Category Created" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// ✅ Get All Categories by Admin
const getCategoriesByAdmin = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = "", status } = req.query;

    const skip = parseInt(limit) || 10;
    const query = {
      name: { $regex: search, $options: "i" },
    };

    // ✅ Add status filter only if provided
    if (status) {
      query.status = status;
    }
    const totalCategories = await Category.find(query);
    const categories = await Category.find(query, null, {
      skip: skip * (parseInt(page) - 1 || 0),
      limit: skip,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: categories,
      count: Math.ceil(totalCategories.length / skip),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Get Category by Slug (Admin)
const getCategoryBySlugByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { slug } = req.params;
    const category = await Category.findOne({ slug }).select([
      "name",
      "description",
      "metaTitle",
      "metaDescription",
      "cover",
      "module",
      "slug",
    ]);

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category Not Found",
      });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Update Category by Slug (Admin)
const updateCategoryBySlugByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { slug } = req.params;
    const { cover, ...others } = req.body;
    await Category.findOneAndUpdate(
      { slug },
      {
        ...others,
        cover: {
          ...cover,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Category Updated" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Delete Category by Slug (Admin)
const deleteCategoryBySlugByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { slug } = req.params;
    const category = await Category.findOneAndDelete({ slug });

    // 1. Delete all ChildCategories for each SubCategory
    for (const subCatId of category.subCategories) {
      // Find childCategories for this subCategory
      const childCategories = await ChildCategory.find({
        subCategory: subCatId,
      });
      const childCategoryIds = childCategories.map((c) => c._id);

      // Delete products linked to these childCategories
      await Product.deleteMany({ childCategory: { $in: childCategoryIds } });

      // Delete the childCategories
      await ChildCategory.deleteMany({ subCategory: subCatId });
    }

    // 2. Delete products linked to subCategories
    await Product.deleteMany({ subCategory: { $in: category.subCategories } });

    // 3. Delete subCategories
    await SubCategory.deleteMany({ _id: { $in: category.subCategories } });

    // 4. Delete products linked directly to this category
    await Product.deleteMany({ category: category._id });
    if (category && category.cover) {
      await singleFileDelete(category.cover._id);
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category Not Found",
      });
    }

    res
      .status(204)
      .json({ success: true, message: "Category Deleted Successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCategoryByAdmin,
  getCategoriesByAdmin,
  getCategoryBySlugByAdmin,
  updateCategoryBySlugByAdmin,
  deleteCategoryBySlugByAdmin,
};
