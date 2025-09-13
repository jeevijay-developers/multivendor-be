const User = require("../../models/User");
const Orders = require("../../models/Order");
const bcrypt = require("bcrypt");
const { getUser } = require("../../config/getUser");

/*    👤 Get Single User Details    */
const getOneUser = async (req, res) => {
  try {
    const user = await getUser(req, res);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*    ✏️ Update User Details    */
const updateUser = async (req, res) => {
  try {
    const user = await getUser(req, res);
    const data = req.body;

    const updatedUser = await User.findByIdAndUpdate(user._id, data, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*    🧾 Get Invoice Details    */
const getInvoice = async (req, res) => {
  try {
    const user = await getUser(req, res);
    const { limit = 10, page = 1 } = req.query;

    const skip = parseInt(limit) * (parseInt(page) - 1) || 0;
    const totalOrderCount = await Orders.countDocuments({
      "user.email": user.email,
    });

    const orders = await Orders.find({ "user.email": user.email }, null, {
      skip,
      limit: parseInt(limit),
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders,
      count: Math.ceil(totalOrderCount / parseInt(limit)),
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/*    🔐 Change User Password    */
const changePassword = async (req, res) => {
  try {
    const user = await getUser(req, res);
    const { password, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New Password Mismatch" });
    }

    if (password === newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter A New Password" });
    }

    const userWithPassword = await User.findById(user._id).select("password");

    if (!userWithPassword) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      userWithPassword.password
    );

    if (!passwordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old Password Incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(
      user._id,
      { password: hashedNewPassword },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({ success: true, message: "Password Changed" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOneUser,
  updateUser,
  getInvoice,
  changePassword,
};
