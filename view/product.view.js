import express from "express";
import mongoose from "mongoose";
import Product from "../model/product.model.js";
import { verifyToken } from "../auth/auth.middleware.js";
import AutherizeRole from "../auth/role.middleware.js";

const router = express.Router();

router.post(
  "/product",
  verifyToken,
  AutherizeRole("admin"),
  async (req, res) => {
    try {
      const product = req.body;

      if (!product || Object.keys(product).length === 0) {
        return res.status(400).json({
          message: "Product data is required",
        });
      }

      const createdProduct = await Product.create(product);

      res.status(201).json({
        message: "Product created successfully",
        success: true,
        product: createdProduct,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create product",
        error: error.message,
      });
    }
  }
);

router.get("/product/search", async (req, res) => {
  try {
    const {
      name,
      category,
      minPrice,
      maxPrice,
      sortBy,
      order = "asc",
    } = req.query;

    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = Number(minPrice);
      if (maxPrice) filter.salePrice.$lte = Number(maxPrice);
    }

    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === "desc" ? -1 : 1;
    }

    const products = await Product.find(filter).sort(sortOptions);

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found",
      });
    }

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Product search failed",
      error: error.message,
    });
  }
});

router.get("/product", async (req, res) => {
  try {
    const products = await Product.find();

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "No products found",
      });
    }

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

router.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
});

router.put(
  "/product/:id",
  verifyToken,
  AutherizeRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid product ID",
        });
      }

      const product = await Product.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      if (!product) {
        return res.status(404).json({
          message: "Product does not exist",
        });
      }

      res.status(200).json({
        message: "Product updated successfully",
        success: true,
        product,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update product",
        error: error.message,
      });
    }
  }
);

router.delete(
  "/product/:id",
  verifyToken,
  AutherizeRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid product ID",
        });
      }

      const deletedProduct = await Product.findByIdAndDelete(id);

      if (!deletedProduct) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.status(200).json({
        message: "Product deleted successfully",
        success: true,
        product: deletedProduct,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete product",
        error: error.message,
      });
    }
  }
);

export default router;
