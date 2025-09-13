const Notifications = require("../../models/Notification");
const Products = require("../../models/Product");
const Orders = require("../../models/Order");
const Coupons = require("../../models/CouponCode");
const User = require("../../models/User");
const Shop = require("../../models/Shop");
const CourierInfo = require("../../models/CourierInfo");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const { getVendor, getAdmin } = require("../../config/getUser");
function isExpired(expirationDate) {
  const currentDateTime = new Date();
  return currentDateTime >= new Date(expirationDate);
}
function generateOrderNumber() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let orderNumber = "";

  // Generate a random alphabet character
  orderNumber += alphabet.charAt(Math.floor(Math.random() * alphabet.length));

  // Generate 4 random digits
  for (let i = 0; i < 6; i++) {
    orderNumber += Math.floor(Math.random() * 10);
  }

  return orderNumber;
}
function readHTMLTemplate() {
  const htmlFilePath = path.join(
    process.cwd(),
    "src/email-templates",
    "order.html"
  );
  return fs.readFileSync(htmlFilePath, "utf8");
}
//User Functions
/* 🛒 Create Order */
const createOrder = async (req, res) => {
  try {
    const {
      items,
      user,
      currency,
      conversionRate,
      paymentMethod,
      paymentId,
      couponCode,
      totalItems,
      shipping,
      description,
      courierName,
      trackingId,
      trackingLink,
    } = await req.body;

    const existingUser = await User.findOne({ email: user.email });

    if (existingUser?.role === "admin" || existingUser?.role === "vendor") {
      return res.status(403).json({
        success: false,
        message: "Admins and Vendors are not allowed to place orders.",
      });
    }

    if (!items || !items.length) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Item(s)" });
    }

    const products = await Products.find({
      _id: { $in: items.map((item) => item.pid) },
    });

    const updatedItems = items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.pid);
      const price = product ? product.salePrice : 0;
      const total = price * item.quantity;

      Products.findOneAndUpdate(
        { _id: item.pid, stockQuantity: { $gte: 0 } },
        { $inc: { stockQuantity: -item.quantity, sold: item.quantity } },
        { new: true, runValidators: true }
      ).exec();

      return {
        ...item,
        total,
        shop: product?.shop,
        imageUrl: item.image,
      };
    });

    const grandTotal = updatedItems.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );
    let discount = 0;

    if (couponCode) {
      const couponData = await Coupons.findOne({ code: couponCode });

      const expired = isExpired(couponData.expire);
      if (expired) {
        return res
          .status(400)
          .json({ success: false, message: "CouponCode Is Expired" });
      }
      // Add the user's email to the usedBy array of the coupon code
      await Coupons.findOneAndUpdate(
        { code: couponCode },
        { $addToSet: { usedBy: user.email } }
      );

      if (couponData && couponData.type === "percent") {
        const percentLess = couponData.discount;
        discount = (percentLess / 100) * grandTotal;
      } else if (couponData) {
        discount = couponData.discount;
      }
    }

    let discountedTotal = grandTotal - discount;
    discountedTotal = discountedTotal || 0;

    const orderNo = await generateOrderNumber();
    const orderCreated = await Orders.create({
      paymentMethod,
      paymentId,
      discount,
      currency,
      description: description || "",
      conversionRate,
      total: discountedTotal + Number(shipping),
      subTotal: grandTotal,
      shipping,
      items: updatedItems.map(({ image, ...others }) => others),
      user: existingUser ? { ...user, _id: existingUser._id } : user,
      totalItems,
      orderNo,
      status: "pending",
      courierName,
      trackingId,
      trackingLink,
    });
    // 🛠 Update user's orders array
    if (existingUser) {
      await User.findByIdAndUpdate(existingUser._id, {
        $push: { orders: orderCreated._id },
      });
    }

    await Notifications.create({
      opened: false,
      title: `${user.firstName} ${user.lastName} placed an order from ${user.city}.`,
      paymentMethod,
      orderId: orderCreated._id,
      city: user.city,
      cover: user?.cover?.url || "",
    });

    let htmlContent = readHTMLTemplate();

    htmlContent = htmlContent.replace(
      /{{recipientName}}/g,
      `${user.firstName} ${user.lastName}`
    );

    let itemsHtml = "";
    updatedItems.forEach((item) => {
      itemsHtml += `
        <tr style='border-bottom: 1px solid #e4e4e4;'>
          <td style="border-radius: 8px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); overflow: hidden; border-spacing: 0; border: 0">
            <img src="${item.imageUrl}" alt="${item.name}" style="width: 62px; height: 62px; object-fit: cover; border-radius: 8px;">
          </td>
          <td style=" padding: 10px; border-spacing: 0; border: 0">${item.name}</td>         
          <td style=" padding: 10px; border-spacing: 0; border: 0">${item.sku}</td>
          <td style=" padding: 10px; border-spacing: 0; border: 0">${item.quantity}</td>
          <td style=" padding: 10px; border-spacing: 0; border: 0">${item.salePrice}</td>
        </tr>
      `;
    });

    htmlContent = htmlContent.replace(/{{items}}/g, itemsHtml);
    htmlContent = htmlContent.replace(/{{grandTotal}}/g, orderCreated.subTotal);
    htmlContent = htmlContent.replace(/{{Shipping}}/g, orderCreated.shipping);
    htmlContent = htmlContent.replace(/{{subTotal}}/g, orderCreated.total);

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
      subject: "Your Order Confirmation",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      success: true,
      message: "Order Placed",
      orderId: orderCreated._id,
      data: items.name,
      orderNo,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
/* 🔍 Get Order by ID */
const getOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    const orderGet = await Orders.findById(id); // Remove curly braces around _id: id

    if (!orderGet) {
      return res
        .status(404)
        .json({ success: false, message: "Order Not Found" });
    }
    const courierInfo = await CourierInfo.find({ orderId: id });

    return res.status(200).json({
      success: true,
      data: orderGet,
      courierInfo,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
};
