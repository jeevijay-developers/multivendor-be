const GeneralSetting = require("../../models/GeneralSetting");

const { getAdmin } = require("../../config/getUser");
const staticData = require("../../config/settings.json");

/* ⚙️ Create General Settings */
const createGeneralSettings = async (req, res) => {
  try {
    await getAdmin(req, res);

    const settings = await GeneralSetting.find();
    if (settings.length) {
      const updatedGeneralSettings = await GeneralSetting.findByIdAndUpdate(
        settings[0]._id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedGeneralSettings) {
        return res.status(404).json({
          success: false,
          message: "General Settings not found",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Settings Updated",
      });
    }

    await GeneralSetting.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Settings Created",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || error,
    });
  }
};

/* ⚙️ Get General Settings */
const getSettings = async (req, res) => {
  try {
    await getAdmin(req, res);

    const settings = await GeneralSetting.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "General Settings not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || error,
    });
  }
};

module.exports = { createGeneralSettings, getSettings };
