const Newsletter = require("../../models/Newsletter");
const { getAdmin } = require("../../config/getUser");

//User Funtion
/* 📝 Create Newsletter Entry */
const createNewsletter = async (req, res) => {
  try {
    // Create a new Newsletter document
    await Newsletter.create({
      email: req.body.email,
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Newsletter Added",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  //User funtion
  createNewsletter,
};
