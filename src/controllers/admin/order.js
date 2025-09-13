const Notifications = require("../../models/Notification");
const Orders = require("../../models/Order");
const User = require("../../models/User");
const Shop = require("../../models/Shop");
const CourierInfo = require("../../models/CourierInfo");
const { getAdmin } = require("../../config/getUser");

/* 📋 Get All Orders (Admin) */
const getOrdersByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const {
      page: pageQuery,
      limit: limitQuery,
      search: searchQuery,
      shop,
      status,
    } = req.query;

    const limit = parseInt(limitQuery) || 10;
    const page = parseInt(pageQuery) || 1;

    const skip = limit * (page - 1);
    let matchQuery = {};

    if (shop) {
      const currentShop = await Shop.findOne({ slug: shop }).select(["_id"]);
      if (!currentShop) {
        return res.status(404).json({
          success: false,
          message: "Shop not found",
        });
      }
      matchQuery["items.shop"] = currentShop._id;
    }
    // Status filter
    if (status) {
      matchQuery.status = status;
    }
    // Search filter
    const searchCondition = searchQuery
      ? {
          $or: [
            { "user.firstName": { $regex: searchQuery, $options: "i" } },
            { "user.lastName": { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};

    const totalOrders = await Orders.countDocuments({
      ...searchCondition,
      ...matchQuery,
    });

    const orders = await Orders.aggregate([
      { $match: { ...searchCondition, ...matchQuery } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          paymentMethod: 1,
          "user.firstName": 1,
          "user.lastName": 1,
          total: 1,
          items: {
            pid: 1,
            name: 1,
            slug: 1,
            quantity: 1,
            price: 1,
            priceSale: 1,
            imageUrl: 1,
          },
          status: 1,
          createdAt: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: orders,
      total: totalOrders,
      count: Math.ceil(totalOrders / parseInt(limit)),
      currentPage: page,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* 🔍 Get One Order by ID (Admin) */
const getOneOrderByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const id = req.params.id;
    await Notifications.findOneAndUpdate(
      { orderId: id },
      {
        opened: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    const orderGet = await Orders.findById({ _id: id });

    const courierInfo = await CourierInfo.find({ orderId: id });
    if (!orderGet) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: orderGet,
      courierInfo,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/* ✏️ Update Order by ID (Admin) */
const updateOrderByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const id = req.params.id;
    const data = await req.body;

    const order = await Orders.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Order Updated",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/* 🗑️ Delete Order by ID (Admin) */
const deleteOrderByAdmin = async (req, res) => {
  try {
    await getAdmin(req, res);
    const orderId = req.params.id;

    // Find the order to be deleted
    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    // Delete the order from the Orders collection
    await Orders.findByIdAndDelete(orderId);

    // Remove the order ID from the user's order array
    await User.findOneAndUpdate(
      { _id: order.user },
      { $pull: { orders: orderId } }
    );

    // Delete notifications related to the order
    await Notifications.deleteMany({ orderId });

    return res.status(204).json({
      success: true,
      message: "Order Deleted",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOrdersByAdmin,
  getOneOrderByAdmin,
  updateOrderByAdmin,
  deleteOrderByAdmin,
};
