const CouponCode = require("../../models/CouponCode");
const { getAdmin } = require("../../config/getUser");
// Admin functions
/* 🎟️ Create Coupon Code by Admin */
const createCouponCodeByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const data = req.body;
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "CouponCode Not Found" });
    }

    const newCouponCode = await CouponCode.create({ ...data });

    return res.status(201).json({
      success: true,
      data: newCouponCode,
      message: "Coupon Code Created",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* 🎟️ Get All Coupon Codes by Admin */
const getCouponCodesByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const { limit = 10, page = 1, search = "" } = req.query;

    const skip = parseInt(limit) * (parseInt(page) - 1) || 0;
    const query = search ? { code: { $regex: search, $options: "i" } } : {};
    const totalCouponCode = await CouponCode.countDocuments(query);

    const couponCodes = await CouponCode.find(query, null, {
      skip: skip,
      limit: parseInt(limit),
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: couponCodes,
      count: Math.ceil(totalCouponCode / parseInt(limit)),
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/* 🎟️ Get One Coupon Code by Admin */
const getOneCouponCodeByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const id = req.params.id;
    const getCouponCode = await CouponCode.findById(id);

    if (!getCouponCode) {
      return res.status(404).json({
        success: false,
        message: "CouponCode Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: getCouponCode,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ✏️ Update Coupon Code by Admin */
const updatedCouponCodeByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const id = req.params.id;
    const data = req.body;

    const updatedCouponCode = await CouponCode.findOneAndUpdate(
      { _id: id },
      { ...data },
      { new: true }
    );

    if (!updatedCouponCode) {
      return res
        .status(404)
        .json({ success: false, message: "CouponCode Not Found" });
    }
    return res.status(200).json({
      success: true,
      data: updatedCouponCode,
      message: "CouponCode Updated",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* 🗑️ Delete Coupon Code by Admin */
const deleteCouponCodeByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const id = req.params.id;
    const getCouponCode = await CouponCode.findById(id);
    if (!getCouponCode) {
      return res.status(404).json({
        success: false,
        message: "CouponCode Not Found",
      });
    }
    await CouponCode.findByIdAndDelete(id);
    return res.status(204).json({
      success: true,
      message: "CouponCode Deleted ",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Admin functions
  createCouponCodeByAdmin,
  getCouponCodesByAdmin,
  getOneCouponCodeByAdmin,
  updatedCouponCodeByAdmin,
  deleteCouponCodeByAdmin,
};
