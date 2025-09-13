const GeneralSetting = require("../../models/GeneralSetting");
const initializeDefaults = require("../../startup/initializer");
// 1. Get Full General Settings
const getGeneralSettings = async (req, res) => {
  try {
    let settings = await GeneralSetting.findOne().select([
      "mainSettings.seo",
      "mainSettings.theme",
      "systemSettings",
      "mainSettings.businessName",
      "mainSettings.domainName",
      "mainSettings.websiteStatus",
      "mainSettings.offlineMessage",
      "languageAndCurrencies",
      "languageOptions",
      "logoDark",
      "logoLight",
      "favicon",
    ]);

    if (!settings) {
      // Initialize defaults
      await initializeDefaults();
      settings = await GeneralSetting.findOne().select([
        "mainSettings.seo",
        "mainSettings.theme",
        "systemSettings",
        "mainSettings.businessName",
        "mainSettings.domainName",
        "mainSettings.websiteStatus",
        "mainSettings.offlineMessage",
        "languageAndCurrencies",
        "languageOptions",
        "logoDark",
        "logoLight",
        "favicon",
      ]);

      if (!settings) {
        return res.status(404).json({
          success: false,
          message: "General settings not found even after initialization",
        });
      }
    }

    const {
      languageAndCurrencies,
      languageOptions,
      systemSettings,
      mainSettings: {
        seo,
        theme,
        businessName,
        domainName,
        websiteStatus,
        offlineMessage,
      },
    } = settings;

    res.status(200).json({
      success: true,
      data: {
        seo,
        theme,
        systemSettings,
        businessName,
        domainName,
        websiteStatus,
        offlineMessage,
        languageAndCurrencies,
        languageOptions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch general settings",
      error: error.message,
    });
  }
};

// 2. Get Only Branding Settings
const getBrandingSettings = async (req, res) => {
  try {
    let settings = await GeneralSetting.findOne().select([
      "logoDark",
      "logoLight",
      "favicon",
      "contact",
      "socialLinks",
      "mainSettings.businessName",
    ]);

    if (!settings) {
      await initializeDefaults();
      settings = await GeneralSetting.findOne().select([
        "logoDark",
        "logoLight",
        "favicon",
        "contact",
        "socialLinks",
        "mainSettings.businessName",
      ]);

      if (!settings) {
        return res.status(404).json({
          success: false,
          message: "Branding settings not found even after initialization",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        logoDark: settings.logoDark,
        logoLight: settings.logoLight,
        favicon: settings.favicon,
        contact: settings.contact,
        socialLinks: settings.socialLinks,
        businessName: settings.mainSettings?.businessName || "",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch branding settings",
      error: error.message,
    });
  }
};

const getContactInfo = async (req, res) => {
  try {
    let settings = await GeneralSetting.findOne(
      {},
      { contact: 1, socialLinks: 1, _id: 0 }
    );
    if (!settings) {
      await initializeDefaults();
      settings = await GeneralSetting.findOne(
        {},
        { contact: 1, socialLinks: 1, _id: 0 }
      );

      if (!settings) {
        return res.status(404).json({
          message: "Contact info not found even after initialization",
        });
      }
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contact info", error });
  }
};
module.exports = { getGeneralSettings, getBrandingSettings, getContactInfo };
