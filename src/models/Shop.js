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
        // optional to allow creating shop without a logo
      },
      url: {
        type: String,
        // optional to allow creating shop without a logo
      },
    },

    slug: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      maxlength: [500, "Description cannot exceed 500 characters."],
    },
  // registrationNumber removed as per new requirements
    stateOfSupplier: { 
      type: String, 
      required: true,
      enum: [
        'Individual', 
        'Partnership Firm', 
        'Private Limited Company (Pvt Ltd)', 
        'Limited Liability Partnership (LLP)'
      ]
    },
    incomeTaxPAN: {
      type: String,
      required: [true, "Income Tax PAN is required"],
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Income Tax PAN must be in format ABCDE1234F"]
    },
    // Letter of Authority - required only when stateOfSupplier is Partnership Firm
    letterOfAuthority: {
      _id: {
        type: String,
        required: function () {
          return this.stateOfSupplier === 'Partnership Firm';
        },
      },
      url: {
        type: String,
        required: function () {
          return this.stateOfSupplier === 'Partnership Firm';
        },
      },
    },
    address: {
      streetAddress: { type: String, required: true },
      city: { type: String, required: true },
      zipcode: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
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
      aadharCardPhotos: [{
        _id: {
          type: String,
          required: [true, "Aadhar card image id is required"]
        },
        url: {
          type: String,
          required: [true, "Aadhar card image url is required"]
        },
        side: {
          type: String,
          enum: ['front', 'back'],
          required: [true, "Aadhar card side (front/back) is required"]
        }
      }],
      panCardPhoto: {
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
    // operationalDetails: {
    //   returnPolicy: { type: String },
    //   handlingTime: { type: Number },
    //   vendorAgreement: {
    //     _id: {
    //       type: String,
    //       required: [true, "Image id is required."],
    //     },
    //     url: {
    //       type: String,
    //       required: [true, "Image url is required."],
    //     },
    //   },
    // },
  },
  {
    timestamps: true,
  }
);

// Indexes for frequently queried fields

const Shop = mongoose.models.Shop || mongoose.model("Shop", ShopSchema);
module.exports = Shop;
