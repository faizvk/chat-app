import express from "express";
import mongoose from "mongoose";
import Cart from "../model/cart.model.js";
import Order from "../model/order.model.js";
import { verifyToken } from "../auth/auth.middleware.js";

const router = express.Router();

router.post("/order/place", verifyToken, async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const userId = req.user.id;

    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        message: "No cart exists",
      });
    }

    if (cart.products.length === 0) {
      return res.status(400).json({
        message: "No products in cart",
      });
    }

    const order = await Order.create({
      userId,
      items: cart.products,
      totalAmount: cart.totalAmount,
      shippingAddress,
      status: "pending",
    });

    cart.products = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to place order",
      error: error.message,
    });
  }
});

router.get("/orders", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

router.get("/order/track/:id", verifyToken, async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "No order exists",
      });
    }

    res.status(200).json({
      message: "Order found",
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
});

router.put("/order/cancel/:id", verifyToken, async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "No order exists",
      });
    }

    if (order.status === "shipped" || order.status === "delivered") {
      return res.status(400).json({
        message: "Order cannot be cancelled after shipping",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "Order already cancelled",
      });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
});

export default router;
