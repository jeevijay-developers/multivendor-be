const Campaign = require("../../models/Campaign");
const Product = require("../../models/Product");
const _ = require("lodash");
const { getVendor, getAdmin, getUser } = require("../../config/getUser");
const { singleFileDelete } = require("../../config/uploader");
// Admin apis
/* 🧑‍💼 Get all campaigns created by admin */
const getAdminCampaigns = async (req, res) => {
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

    const totalCampaigns = await Campaign.countDocuments(query);

    const campaigns = await Campaign.find(query, null, {
      skip: skip,
      limit: parseInt(limit),
    })
      .select([
        "slug",
        "status",
        "products",
        "name",
        "startDate",
        "endDate",
        "discount",
        "discountType",
      ])
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      data: campaigns,
      count: Math.ceil(totalCampaigns / limit),
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/* 📢 Create a new campaign */
const createCampaign = async (req, res) => {
  try {
    const admin = await getAdmin(req, res);
    const { cover, products, discountType, discount, ...others } = req.body;
    const productsWithPrice = await Product.find({
      _id: { $in: products },
    }).select(["price", "salePrice"]);
    for (const product of productsWithPrice) {
      const newsalePrice =
        discountType === "percent"
          ? product.price * (1 - discount / 100)
          : product.price - discount;
      await Product.updateOne(
        { _id: product._id },
        { $set: { salePrice: newsalePrice, oldsalePrice: product.salePrice } }
      );
    }

    await Campaign.create({
      ...others,
      products,
      discountType,
      discount,
      cover: {
        ...cover,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Campaign created",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/* 🧾 Get single campaign details by admin */
const getOneCampaignByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    // const admin = await getAdmin(req, res);
    const { slug } = req.params;

    const campaign = await Campaign.findOne({ slug }).populate({
      path: "products",
      select: ["name", "type", "images", "variants", "salePrice"],
    });

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign Not Found" });
    }
    const productsWithPrices = campaign.products.map(
      ({ variants, ...product }) => {
        return {
          ...product._doc,
          salePrice:
            product._doc.type === "variable"
              ? variants[0].salePrice
              : product._doc.salePrice,
          image: product._doc.images[0],
        };
      }
    );
    return res.status(200).json({
      success: true,
      data: { ...campaign._doc, products: [...productsWithPrices] },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/* 🛠️ Update a single campaign by admin */
const updateOneCampaignByAdmin = async (req, res) => {
  try {
    const { slug } = req.params;
    const admin = await getAdmin(req, res);
    const { cover, ...others } = req.body;
    const campaign = await Campaign.findOne({ slug });
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign Not Found" });
    }
    const missingProducts = campaign.products.filter(
      (product) => !req.body.products.includes(product)
    );

    const productsWithPrice = await Product.find({
      _id: { $in: missingProducts },
    }).select(["price", "salePrice"]);
    for (const product of productsWithPrice) {
      await Product.updateOne(
        { _id: product._id },
        { $set: { salePrice: product.oldsalePrice, oldsalePrice: null } }
      );
    }
    await Campaign.findOneAndUpdate(
      { slug: slug },
      {
        ...others,

        cover: { ...cover },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: "Updated Campaign" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/* 🗑️ Delete a single campaign by admin */
const deleteOneCampaignByAdmin = async (req, res) => {
  try {
    const admin = await getAdmin(req, res);
    const { cid } = req.params;
    const campaign = await Campaign.findOne({ _id: cid });
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign Not Found" });
    }
    await singleFileDelete(campaign.cover._id);

    await Campaign.deleteOne({ _id: cid }); // Corrected to pass an object to deleteOne method
    return res.status(204).json({
      success: true,
      message: "Campaign Deleted Successfully", // Corrected message typo
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
module.exports = {
  getAdminCampaigns,
  createCampaign,
  getOneCampaignByAdmin,
  updateOneCampaignByAdmin,
  deleteOneCampaignByAdmin,
};
