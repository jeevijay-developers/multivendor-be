const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "approved",
        "pending",
        "in review",
        "action required",
        "blocked",
        "rejected",
      ],
      required: true,
    },
    products: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
    ],

    logo: {
      _id: {
        type: String,
        required: [true, "Image id is required."],
      },
      url: {
        type: String,
        required: [true, "Image url is required."],
      },
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    metaTitle: {
      type: String,
      maxlength: [100, "Meta title cannot exceed 100 characters."],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      maxlength: [500, "Description cannot exceed 500 characters."],
    },
    metaDescription: {
      type: String,
      maxlength: [200, "Meta description cannot exceed 200 characters."],
    },
    registrationNumber: { type: String, required: true, unique: true },
    address: {
      country: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      streetAddress: { type: String, required: true },
    },
    contactPerson: { type: String },
    shopEmail: { type: String, required: true },
    shopPhone: { type: String, required: true },
    website: { type: String },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },

    financialDetails: {
      paymentMethod: { type: String, enum: ["paypal", "bank"] },
      paypal: {
        email: {
          type: String,
          // required: function () {
          //   return this.financialDetails.paymentMethod === "paypal";
          // },
        },
      },
      bank: {
        accountNumber: {
          type: String,
          // required: function () {
          //   return this.financialDetails.paymentMethod === "bank";
          // },
        },
        bankName: {
          type: String,
          // required: function () {
          //   return this.financialDetails.paymentMethod === "bank";
          // },
        },
        holderName: {
          type: String,
          // required: function () {
          //   return this.financialDetails.paymentMethod === "bank";
          // },
        },
        holderEmail: {
          type: String,
          // required: function () {
          //   return this.financialDetails.paymentMethod === "bank";
          // },
        },
        address: { type: String },
        routingNumber: { type: String },
        swiftCode: { type: String },
      },
    },
    identityVerification: {
      governmentId: {
        _id: {
          type: String,
          required: [true, "Image id is required."],
        },
        url: {
          type: String,
          required: [true, "Image url is required."],
        },
      },
      proofOfAddress: {
        _id: {
          type: String,
          required: [true, "Image id is required."],
        },
        url: {
          type: String,
          required: [true, "Image url is required."],
        },
      },
    },
    taxIdentificationNumber: { type: String, required: true },
    vatRegistrationNumber: { type: String },
    
    // Owner Details (User's data)
    ownerDetails: {
      aadharCardNumber: {
        type: String,
        required: [true, "Aadhar card number is required"],
        match: [/^[0-9]{12}$/, "Aadhar card number must be exactly 12 digits"]
      },
      panNumber: {
        type: String,
        required: [true, "PAN number is required"],
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "PAN number must be in format ABCDE1234F"]
      },
      ifscCode: {
        type: String,
        required: [true, "IFSC code is required"],
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC code must be in valid format"]
      },
      gstNumber: {
        type: String,
        required: [true, "GST number is required"],
        match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "GST number must be in valid format"]
      },
      bankBranch: {
        type: String,
        required: [true, "Bank branch is required"]
      },
      accountNumber: {
        type: String,
        required: [true, "Account number is required"],
        match: [/^[0-9]{9,18}$/, "Account number must be between 9-18 digits"]
      },
      accountHolderName: {
        type: String,
        required: [true, "Account holder name is required"]
      },
      aadharCard: {
        _id: {
          type: String,
          required: [true, "Aadhar card image id is required"]
        },
        url: {
          type: String,
          required: [true, "Aadhar card image url is required"]
        }
      },
      panCard: {
        _id: {
          type: String,
          required: [true, "PAN card image id is required"]
        },
        url: {
          type: String,
          required: [true, "PAN card image url is required"]
        }
      },
      cancelCheque: {
        _id: {
          type: String,
          required: [true, "Cancel cheque image id is required"]
        },
        url: {
          type: String,
          required: [true, "Cancel cheque image url is required"]
        }
      }
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to auto-generate slug
ShopSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    // Take first 6 characters of shop name, remove spaces and special characters
    const nameSlug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters and spaces
      .substring(0, 6);
    
    // Get last 4 characters of the ObjectId
    const idSlug = this._id.toString().slice(-4);
    
    // Combine to create slug (max 10 characters)
    this.slug = nameSlug + idSlug;
  }
  next();
});

// Indexes for frequently queried fields
ShopSchema.index({ slug: 1 }); // Index for slug
ShopSchema.index({ vendor: 1 }); // Index for vendor lookup
ShopSchema.index({ status: 1 }); // Index for status filtering

const Shop = mongoose.models.Shop || mongoose.model("Shop", ShopSchema);
module.exports = Shop;
