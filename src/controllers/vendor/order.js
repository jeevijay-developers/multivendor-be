const Orders = require("../../models/Order");
const Shop = require("../../models/Shop");
const CourierInfo = require("../../models/CourierInfo");

const { getVendor } = require("../../config/getUser");

/* 📦 Get Orders (Vendor) */
const getOrdersByVendor = async (req, res) => {
  try {
    const vendor = await getVendor(req, res);
    const shop = await Shop.findOne({ vendor: vendor._id.toString() });
    if (!shop) {
      res.status(404).json({ success: false, message: "Shop not found" });
    }
    const { limit = 10, page = 1, search = "" } = req.query;

    const skip = parseInt(limit) * (parseInt(page) - 1) || 0;
    const pipeline = [
      {
        $match: {
          "items.shop": shop._id, // Assuming 'items.shop' refers to the shop ID associated with the order
          $or: [
            { "user.firstName": { $regex: new RegExp(search, "i") } },
            { "user.lastName": { $regex: new RegExp(search, "i") } },
          ],
        },
      },
    ];
    const totalOrderCount = await Orders.aggregate([
      ...pipeline,
      {
        $count: "totalOrderCount", // Name the count field as "totalOrderCount"
      },
    ]);
    // Access the count from the first element of the result array
    const count =
      totalOrderCount.length > 0 ? totalOrderCount[0].totalOrderCount : 0;

    const orders = await Orders.aggregate([
      ...pipeline,
      {
        $sort: { createdAt: -1 }, // Sort by createdAt in descending order
      },
      {
        $skip: skip, // Skip documents based on pagination
      },
      {
        $limit: parseInt(limit), // Limit the number of documents retrieved
      },
    ]);
    return res.status(200).json({
      success: true,
      data: orders,
      total: count,
      count: Math.ceil(count / parseInt(limit)),
      currentPage: page,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/* ✏️ Update Order by ID (Vendor) */
const updateOrderByVendor = async (req, res) => {
  try {
    await getVendor(req, res);
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
const getOrderByVendor = async (req, res) => {
  try {
    const vendor = await getVendor(req, res);
    if (!vendor || !vendor.shop) {
      return res.status(400).json({
        success: false,
        message: "Vendor shop not found",
      });
    }
    console.log(vendor);
    const vendorShopId = vendor.shop.toString();
    const id = await req.params.id;
    const order = await Orders.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    const vendorItems = order.items.filter((item) => {
      return item.shop && item.shop.toString() === vendorShopId;
    });

    if (!vendorItems.length) {
      return res.status(403).json({
        success: false,
        message: "You have no products in this order",
      });
    }
    const courierInfo = await CourierInfo.find({
      orderId: id,
      vendorId: vendor._id.toString(),
    });
    return res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        items: vendorItems,
      },
      courierInfo,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
module.exports = {
  getOrdersByVendor,
  updateOrderByVendor,
  getOrderByVendor,
};
