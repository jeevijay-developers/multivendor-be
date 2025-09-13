const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema(
  {
    cover: {
      _id: {
        type: String,
        required: [true, "Image id is required."],
      },
      url: {
        type: String,
        required: [true, "Image url is required."],
      },
    },
    name: {
      type: String,
      required: [true, "Name is required."],
      maxlength: [100, "Name cannot exceed 100 characters."],
      index: true,
    },
    metaTitle: {
      type: String,
      required: [true, "Meta title is required."],
      maxlength: [100, "Meta title cannot exceed 100 characters."],
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      maxlength: [500, "Description cannot exceed 500 characters."],
    },
    metaDescription: {
      type: String,
      required: [true, "Meta description is required."],
      maxlength: [200, "Meta description cannot exceed 200 characters."],
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    products: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    discountType: {
      type: String,
      enum: ["fixed", "percent"],
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Campaign =
  mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema);
module.exports = Campaign;
