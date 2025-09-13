const Review = require("../../models/Review");
const Products = require("../../models/Product");
const Users = require("../../models/User");
const { getUser, getAdmin } = require("../../config/getUser");
const Orders = require("../../models/Order");

/*    ⭐ Get Reviews by Product ID (Public)    */
const getReviewsbyPid = async (req, res) => {
  try {
    // Populate the product
    const pid = req.params.pid;
    // Get reviews for the populated product
    const reviews = await Review.find({
      product: pid,
    })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: ["firstName", "lastName", "cover", "orders"],
      });
    const product = await Products.findById(pid).select(["slug"]);

    const reviewsSummery = await Products.aggregate([
      {
        $match: { slug: product.slug },
      },

      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      },
      {
        $unwind: "$reviews",
      },

      {
        $group: {
          _id: "$reviews.rating",
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({ success: true, reviewsSummery, reviews });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/*    ⭐ Create Review by User    */
const createReview = async (req, res) => {
  try {
    const user = await getUser(req, res);
    const uid = user._id.toString();
    const { pid, rating, review: reviewText, images } = req.body;

    const orders = await Orders.find({
      "user.email": user.email,
      "items.pid": pid,
    });

    const updatedImages = await Promise.all(
      images.map(async (image) => {
        return { url: image };
      })
    );
    const review = await Review.create({
      product: pid,
      review: reviewText,
      rating,
      images: updatedImages,
      user: uid,
      isPurchased: Boolean(orders.length),
    });

    await Products.findByIdAndUpdate(pid, {
      $addToSet: {
        reviews: review._id,
      },
    });

    return res.status(201).json({ success: true, data: review, user });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  //User functions
  getReviewsbyPid,
  createReview,
};
