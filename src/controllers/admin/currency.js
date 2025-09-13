const Currency = require("../../models/Currencies");
/* 💱 Get Admin Currencies */
const getAdminCurrencies = async (req, res) => {
  try {
    const { page: pageQuery, limit: limitQuery } = req.query;

    const limit = parseInt(limitQuery) || 10;
    const page = parseInt(pageQuery) || 1;
    const search = req.query.search || "";
    const searchQuery = {
      $or: [
        { name: { $regex: search, $options: "i" } }, // Search by name (case-insensitive)
        { code: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ],
    };
    // Calculate skip correctly
    const skip = limit * (page - 1);

    const currencies = await Currency.aggregate([
      { $match: search ? searchQuery : {} },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },

      {
        $project: {
          name: 1,
          code: 1,
          rate: 1,
          country: 1,
          status: 1,
          base: 1,
          createdAt: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: currencies,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
/* 🔍 Get Currency by ID */
const getCurrency = async (req, res) => {
  try {
    const currency = await Currency.findById(req.params.cid);

    res.status(200).json({
      success: true,
      data: currency,
      message: "Currency created!",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
/* ➕ Create New Currency */
const createCurrency = async (req, res) => {
  try {
    const currency = await Currency.findOne({ code: req.body.code });
    if (currency?.base) {
      await Currency.findByIdAndUpdate(currency._id, { base: false });
    }
    const newCurrency = await Currency.create({ ...req.body });

    res.status(201).json({
      success: true,
      data: newCurrency,
      message: "Currency created!",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
/* ✏️ Update Currency */
const updateCurrency = async (req, res) => {
  try {
    const currency = await Currency.findById(req.params.cid);
    if (currency?.base) {
      await Currency.findByIdAndUpdate(currency._id, { base: false });
    }
    const updatedCurrency = await Currency.findByIdAndUpdate(
      req.params.cid,
      req.body,
      {
        new: true, // Ensure the returned document is the updated one
      }
    );

    res.status(200).json({
      success: true,
      data: updatedCurrency,
      message: "Currency updated!",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
/* 🗑️ Delete Currency */
const deleteCurrency = async (req, res) => {
  try {
    const currency = await Currency.findByIdAndDelete(req.params.cid, {
      ...req.body,
    });

    res.status(204).json({
      success: true,
      data: currency,
      message: "Currency deleted!",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminCurrencies,
  getCurrency,
  createCurrency,
  updateCurrency,
  deleteCurrency,
};
