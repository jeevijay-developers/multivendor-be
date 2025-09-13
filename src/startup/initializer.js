const GeneralSetting = require("../models/GeneralSetting");
const Currency = require("../models/Currencies");
const fs = require("fs");
const path = require("path");

const initializeDefaults = async () => {
  try {
    const generalSettingsCount = await GeneralSetting.countDocuments();
    if (generalSettingsCount === 0) {
      const defaultSettings = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "../config/settings.json"),
          "utf-8"
        )
      );
      await GeneralSetting.create(defaultSettings);
      console.log("✅ Default General Settings initialized.");
    }

    const currencyCount = await Currency.countDocuments();
    if (currencyCount === 0) {
      const defaultCurrencies = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "../config/currencies.json"),
          "utf-8"
        )
      );
      await Currency.insertMany(defaultCurrencies);
      console.log("✅ Default Currencies initialized.");
    }
  } catch (error) {
    console.error("❌ Error initializing defaults:", error.message);
  }
};

module.exports = initializeDefaults;
