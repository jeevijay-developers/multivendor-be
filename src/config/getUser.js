const Users = require("../models/User");
const Shop = require("../models/Shop");

exports.getUser = async (req, res, requireVerify) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "You Must Be Logged In." });
  }

  try {
    const user = await Users.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found." });
    }
    if (!requireVerify && !user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User Email Is Not Verified." });
    }

    return user;
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdmin = async (req, res) => {
  try {
    // if (req.method !== 'GET') {
    //   return res
    //     .status(405)
    //     .json({
    //       success: false,
    //       message: 'Action not allowed in demo. Purchase for full access.',
    //     });
    // }
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "You Must Be Logged In." });
    }

    const user = await Users.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found." });
    }
    if (!user.role.includes("admin")) {
      return res
        .status(403)
        .json({ success: false, message: "Access Denied." });
    }

    return user;
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVendor = async (req, res) => {
  try {
    // if (req.method !== 'GET') {
    //   return res
    //     .status(405)
    //     .json({
    //       success: false,
    //       message: 'Action not allowed in demo. Purchase for full access.',
    //     });
    // }
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "You Must Be Logged In." });
    }

    const user = await Users.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found." });
    }
    if (!user.role.includes("vendor")) {
      return res
        .status(403)
        .json({ success: false, message: "Access Denied." });
    }
    return user;
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
