const SubCategory = require("../../models/SubCategory");
const ChildCategory = require("../../models/ChildCategory");
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const { singleFileDelete } = require("../../config/uploader");
const { getAdmin } = require("../../config/getUser");
/*    🗂️ Create Subcategory by Admin    */
const createSubCategoryByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { cover, ...others } = req.body;

    const category = await SubCategory.create({
      ...others,
      cover: {
        ...cover,
      },
    });
    await Category.findByIdAndUpdate(others.parentCategory, {
      $addToSet: {
        subCategories: category._id,
      },
    });

    res.status(201).json({ success: true, message: "Subcategory Created" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/*    📂 Get All Subcategories by Admin    */
const getSubCategoriesByAdmin = async (req, res) => {
  try {
    const { limit = 10, page = 1, search = "", category, status } = req.query;
    const currentCategory = category
      ? await Category.findOne({ slug: category })
      : null;
    if (category && !currentCategory) {
      res.status(404).json({ success: false, message: "Category not found!" });
    }
    const skip = parseInt(limit) || 10;
    const query = {
      name: { $regex: search, $options: "i" },
      ...(currentCategory && { parentCategory: currentCategory._id }),
    };
    // ✅ Add status filter only if provided
    if (status) {
      query.status = status;
    }

    const totalSubCategories = await SubCategory.find(query);

    const subcategories = await SubCategory.find(query, null, {
      skip: skip * (parseInt(page) - 1 || 0),
      limit: skip,
    })
      .populate({ path: "parentCategory", select: ["name", "cover", "slug"] })
      .sort({
        createdAt: -1,
      });
    res.status(200).json({
      success: true,
      data: subcategories,
      count: Math.ceil(totalSubCategories.length / skip),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
/*    🔍 Get Subcategory by Slug (Admin)    */
const getSubCategoryBySlugByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { slug } = req.params;
    const subcategories = await SubCategory.findOne({ slug });
    const categories = await Category.find().select(["name"]);

    if (!subcategories) {
      return res.status(400).json({
        success: false,
        message: "SubCategory Not Found",
      });
    }

    res.status(200).json({ success: true, data: subcategories, categories });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
/*    ✏️ Update Subcategory by Slug (Admin)    */
const updateSubCategoryBySlugByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { slug } = req.params;
    const { cover, ...others } = req.body;
    const currentCategory = await SubCategory.findOneAndUpdate(
      { slug },
      {
        ...others,
        cover: {
          ...cover,
        },
      },
      { new: true, runValidators: true }
    );
    // Check if parent category is updated
    if (
      String(currentCategory.parentCategory) !== String(others.parentCategory)
    ) {
      // Remove subcategory from old parent category
      await Category.findByIdAndUpdate(currentCategory.parentCategory, {
        $pull: { subCategories: currentCategory._id },
      });

      // Add subcategory to new parent category
      await Category.findByIdAndUpdate(others.parentCategory, {
        $addToSet: { subCategories: currentCategory._id },
      });
    }

    res.status(200).json({
      success: true,
      message: "Subcategory Updated",
      currentCategory,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
/*    🗑️ Delete Subcategory by Slug (Admin)    */
const deleteSubCategoryBySlugByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { slug } = req.params;
    // 1. Delete all childCategories linked to this subCategory
    const childCategories = await ChildCategory.find({
      subCategory: subCategory._id,
    });
    const childCategoryIds = childCategories.map((c) => c._id);

    // Delete products linked to these childCategories
    await Product.deleteMany({ childCategory: { $in: childCategoryIds } });

    // Delete childCategories
    await ChildCategory.deleteMany({ subCategory: subCategory._id });

    // 2. Delete products linked directly to this subCategory
    await Product.deleteMany({ subCategory: subCategory._id });
    const subCategory = await SubCategory.findOneAndDelete({ slug });
    const dataaa = await singleFileDelete(subCategory.cover._id);

    await Category.findByIdAndUpdate(subCategory.parentCategory, {
      $pull: { subCategories: subCategory._id },
    });

    if (!subCategory) {
      return res.status(400).json({
        success: false,
        message: "SubCategory Not Found",
      });
    }

    res
      .status(204)
      .json({ success: true, message: "SubCategory Deleted Successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
/*    📂 Get All Subcategories by Admin    */
const getAllSubCategoriesByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const subcategories = await SubCategories.find()
      .populate({ path: "parentCategory", select: ["name", "cover", "slug"] })
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      data: subcategories,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSubCategoryByAdmin,
  updateSubCategoryBySlugByAdmin,
  deleteSubCategoryBySlugByAdmin,
  getSubCategoriesByAdmin,
  getSubCategoryBySlugByAdmin,
  getAllSubCategoriesByAdmin,
};
