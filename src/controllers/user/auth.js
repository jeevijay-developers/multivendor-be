const User = require("../../models/User");
const Products = require("../../models/Product");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { getUser } = require("../../config/getUser");

/* 📝 Register a new user (Sign Up) */
const signUp = async (req, res) => {
  try {
    const request = req.body;
    const UserCount = await User.countDocuments();
    const existingUser = await User.findOne({ email: request.email });

    if (existingUser) {
      return res.status(400).json({
        UserCount,
        success: false,
        message: "User With This Email Already Exists",
      });
    }

    // You can still generate an OTP if you want to store it, but it's not required
    // const otp = otpGenerator.generate(6, {
    //   upperCaseAlphabets: false,
    //   specialChars: false,
    //   lowerCaseAlphabets: false,
    //   digits: true,
    // });

    const user = await User.create({
      ...request,
      // otp, // Not needed if not sending OTP
      role: Boolean(UserCount) ? request.role || "user" : "super-admin",
      isVerified: true, // Mark as verified since no email verification
    });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // --- Removed all nodemailer/email logic ---

    res.status(201).json({
      success: true,
      message: "Created User Successfully",
      token,
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* 🔐 Log in an existing user (Sign In) */
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    if (!user.password) {
      return res
        .status(404)
        .json({ success: false, message: "User Password Not Found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const products = await Products.aggregate([
      {
        $match: {
          _id: { $in: user.wishlist },
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "reviews",
          foreignField: "_id",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          variantWithLeastStock: {
            $reduce: {
              input: "$variants",
              initialValue: {
                stockQuantity: Number.MAX_VALUE,
                price: null,
                salePrice: null,
              },
              in: {
                $cond: [
                  { $lt: ["$$this.stockQuantity", "$$value.stockQuantity"] },
                  {
                    stockQuantity: "$$this.stockQuantity",
                    price: "$$this.price",
                    salePrice: "$$this.salePrice",
                  },
                  "$$value",
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          stockQuantity: {
            $cond: [
              { $eq: ["$type", "variable"] },
              "$variantWithLeastStock.stockQuantity",
              "$stockQuantity",
            ],
          },
          price: {
            $cond: [
              { $eq: ["$type", "variable"] },
              "$variantWithLeastStock.price",
              "$price",
            ],
          },
          salePrice: {
            $cond: [
              { $eq: ["$type", "variable"] },
              "$variantWithLeastStock.salePrice",
              "$salePrice",
            ],
          },
        },
      },
      {
        $project: {
          images: 1,
          name: 1,
          slug: 1,
          colors: 1,
          discount: 1,
          likes: 1,
          salePrice: 1,
          price: 1,
          averageRating: 1,
          stockQuantity: 1,
          vendor: 1,
          shop: 1,
          createdAt: 1,
        },
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Login Successfully",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        cover: user.cover,
        gender: user.gender,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        zip: user.zip,
        state: user.state,
        about: user.about,
        role: user.role,
        wishlist: products,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/* 📧 Send reset password link to user's email */
const forgetPassword = async (req, res) => {
  try {
    const request = req.body;
    const user = await User.findOne({ email: request.email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const resetPasswordLink = `${request.origin}/auth/reset-password/${token}`;
    const htmlFilePath = path.join(
      process.cwd(),
      "src/email-templates",
      "forget.html"
    );
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");
    htmlContent = htmlContent.replace(
      /href="javascript:void\(0\);"/g,
      `href="${resetPasswordLink}"`
    );

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.RECEIVING_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.RECEIVING_EMAIL,
      to: user.email,
      subject: "Verify your email",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Forgot Password Email Sent Successfully.",
      token,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* 🔒 Reset user password using token */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid Or Expired Token. Please Request A New One.",
      });
    }

    const user = await User.findById(decoded._id).select("password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }
    if (!newPassword || !user.password) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Data. Both NewPassword And User Password Are Required.",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New Password Must Be Different From The Old Password.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: "Password Updated Successfully.",
      user,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* ✅ Verify user OTP code */
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await getUser(req, res, "not-verified");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "OTP Has Already Been Verified" });
    }

    let message = "";
    // Verify the OTP
    if (otp === user.otp) {
      user.isVerified = true;
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "OTP Verified Successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* 🔄 Resend OTP code to user */
const resendOtp = async (req, res) => {
  try {
    const user = await getUser(req, res, "not-verified");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "OTP Has Already Been Verified" });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true,
    });
    await User.findByIdAndUpdate(user._id, { otp: otp.toString() });

    const htmlFilePath = path.join(
      process.cwd(),
      "src/email-templates",
      "otp.html"
    );
    let htmlContent = fs.readFileSync(htmlFilePath, "utf8");
    htmlContent = htmlContent.replace(/<h1>[\s\d]*<\/h1>/g, `<h1>${otp}</h1>`);
    htmlContent = htmlContent.replace(/usingyourmail@gmail\.com/g, user.email);

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.RECEIVING_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.RECEIVING_EMAIL,
      to: user.email,
      subject: "Verify your email",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP Resent Successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Auth Functions
  signUp,
  signIn,
  forgetPassword,
  resetPassword,
  verifyOtp,
  resendOtp,
};
