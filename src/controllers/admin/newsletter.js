const Newsletter = require("../../models/Newsletter");
const { getAdmin } = require("../../config/getUser");
//Admin Funtion
/* 📰 Get Newsletters (Admin) */
const getNewslettersByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const skip = 10;
    const NewsletterTotal = await Newsletter.find({}, null, {}).sort({
      createdAt: -1,
    });

    const page = parseInt(req.query.page) || 1;

    const data = await Newsletter.find({}, null, {
      skip: skip * (page - 1),
      limit: skip,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: data,
      count: Math.ceil(NewsletterTotal.length / skip),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
module.exports = {
  //Admin funtion
  getNewslettersByAdmin,
};
