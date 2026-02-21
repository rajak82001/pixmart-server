const Razorpay = require("razorpay");
const User = require("../models/User");
const Order = require("../models/Order");
const Post = require("../models/Post");
const crypto = require("crypto");

// Create a new instance of Razorpay
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const generateOrder = async (req, res) => {
  const purchaserId = req.id;
  const { price } = req.body;

  try {
    let user = await User.findById(purchaserId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const options = {
      amount: Number(price * 100),
      currency: "INR", // Changed to INR - Razorpay requires INR for test mode domestic cards
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data: order });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyOrder = async (req, res) => {
  const purchaserId = req.id;
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    postUrl,
    author,
    title,
    price,
    postId,
  } = req.body;

  try {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const isAuthentic = expectedSign === razorpay_signature;
    if (isAuthentic) {
      const order = new Order({
        purchaserId,
        postUrl,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        author,
        title,
        price,
      });
      const savedOrder = await order.save();

      // record the purchase using the actual post id (not the order id)
      await User.findByIdAndUpdate(purchaserId, {
        $push: { purchased: postId },
      });

      await Post.findByIdAndUpdate(postId, {
        $push: { purchasedBy: purchaserId },
      });

      // return the post document so the client can immediately update its state
      const purchasedPost = await Post.findById(postId);

      return res
        .status(200)
        .json({
          success: true,
          message: "Payment successful",
          purchasedPost,
        });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateOrder, verifyOrder };
