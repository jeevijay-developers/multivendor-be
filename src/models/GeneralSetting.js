const mongoose = require("mongoose");

const GeneralSettingSchema = new mongoose.Schema(
  {
    mainSettings: {
      businessName: {
        type: String,
        required: true,
      },
      domainName: {
        type: String,
        required: true,
      },

      websiteStatus: {
        type: Boolean,
        required: true,
      },
      offlineMessage: {
        type: String,
        required: true,
      },
      seo: {
        metaTitle: {
          type: String,
          required: true,
        },
        metaDescription: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        tags: {
          type: Array,
          required: true,
        },
      },
      theme: {
        palette: {
          primary: {
            type: String,
            required: true,
            default: "#1C6BD2",
          },
          secondary: {
            type: String,
            required: true,
            default: "#2288EB",
          },
          paperLight: {
            type: String,
            required: true,
            default: "#FFFFFF",
          },
          paperDark: {
            type: String,
            required: true,
            default: "#212B36",
          },
          defaultDark: {
            type: String,
            required: true,
            default: "#161C24",
          },
          defaultLight: {
            type: String,
            required: true,
            default: "#F9FAFB",
          },
        },
        themeName: {
          type: String,
          required: true,
          default: "default",
        },
        fontFamily: {
          type: String,
          enum: ["figtree", "montserrat", "roboto", "open-sans"],
          required: true,
        },
      },
    },
    // ✅ Branding Fields (Root level now)

    systemSettings: {
      gaId: {
        type: String,
        required: true,
      },
      gtmId: {
        type: String,
        required: true,
      },
    },
    slides: [
      {
        image: {
          _id: {
            type: String,
            required: [true, "Image id is required."],
          },
          url: {
            type: String,
            required: [true, "Image url is required."],
          },
        },

        link: {
          type: String,
        },
      },
    ],
    banner1: {
      image: {
        _id: {
          type: String,
          required: [true, "Image id is required."],
        },
        url: {
          type: String,
          required: [true, "Image url is required."],
        },
      },

      link: {
        type: String,
      },
    },
    banner2: {
      image: {
        _id: {
          type: String,
          required: [true, "Image id is required."],
        },
        url: {
          type: String,
          required: [true, "Image url is required."],
        },
      },

      link: {
        type: String,
      },
    },
    contact: {
      address: {
        type: String,
        required: true,
      },
      addressOnMap: {
        type: String,
        required: true,
      },
      lat: {
        type: String,
        required: true,
      },
      long: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        index: true,
      },
      phone: {
        type: String,
        required: true,
      },
      whatsappNo: {
        type: String,
      },
    },

    socialLinks: {
      facebook: {
        type: String,
        required: true,
      },
      twitter: {
        type: String,
        required: true,
      },
      linkedin: {
        type: String,
        required: true,
      },
      instagram: {
        type: String,
        required: true,
      },
      whatsapp: {
        type: String,
        required: true,
      },
    },
    logoDark: {
      _id: { type: String, required: true },
      url: { type: String, required: true },
    },
    logoLight: {
      _id: { type: String, required: true },
      url: { type: String, required: true },
    },
    favicon: {
      _id: { type: String, required: true },
      url: { type: String, required: true },
    },
  },
  { timestamps: true }
);
// Create and export the model
const GeneralSetting =
  mongoose.models.GeneralSetting ||
  mongoose.model("GeneralSetting", GeneralSettingSchema);

module.exports = GeneralSetting;
