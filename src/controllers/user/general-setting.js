const GeneralSetting = require("../../models/GeneralSetting"); // Adjust path as needed
const { getAdmin } = require("../../config/getUser");
const staticData = require("../../config/settings.json");
const Currency = require("../../models/Currencies");
const initializeDefaults = require("../../startup/initializer"); // Adjust path
/* 👤 Get User Settings */
const getUserSettings = async (req, res) => {
  try {
    let settings = await GeneralSetting.findOne();

    if (!settings) {
      // Initialize defaults if not found
      await initializeDefaults();
      // Fetch again after initializing
      settings = await GeneralSetting.findOne();

      // If still not found, return error
      if (!settings) {
        return res.status(404).json({
          success: false,
          message: "Settings not found after initialization",
        });
      }
    }

    const currency = await Currency.findOne({
      base: true,
    });

    return res.status(200).json({
      success: true,
      data: { ...settings._doc, baseCurrency: currency?.code || "USD" },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || error,
    });
  }
};

module.exports = { getUserSettings };
