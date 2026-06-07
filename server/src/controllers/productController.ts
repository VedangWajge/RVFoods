import type { Response, Request } from "express";
import { Product } from "../models/Product.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
import {
  createProductSchema,
  updateProductSchema,
  getProductQuerySchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "../validators/productSchemas.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getProductQuerySchema.parse(req.query);

    const {
      category,
      search,
      sort,
      minPrice,
      maxPrice,
      minRating,
      page = "1",
      limit = "12",
      featured,
    } = query;

    // Build query
    const filter: any = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (minRating) {
      filter["ratings.average"] = { $gte: parseFloat(minRating) };
    }

    // Build sort
    let sortObj: any = {};
    switch (sort) {
      case "price-asc":
        sortObj = { price: 1 };
        break;
      case "price-desc":
        sortObj = { price: -1 };
        break;
      case "rating-desc":
        sortObj = { "ratings.average": -1 };
        break;
      case "newest":
        sortObj = { createdAt: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    sendSuccess(
      res,
      "Products retrieved successfully",
      {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      }
    );
  }
);

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProductBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, isActive: true });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    sendSuccess(res, "Product retrieved successfully", product);
  }
);

// @desc    Create new product
// @route   POST /api/products
// @access  Admin
export const createProduct = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const validatedData: CreateProductInput = createProductSchema.parse(
      req.body
    );

    const product = await Product.create(validatedData);

    sendSuccess(res, "Product created successfully", product, 201);
  }
);

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const validatedData: UpdateProductInput = updateProductSchema.parse(
      req.body
    );

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    sendSuccess(res, "Product updated successfully", product);
  }
);

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((img) =>
        deleteImage(img.publicId)
      );
      await Promise.all(deletePromises);
    }

    await Product.findByIdAndDelete(id);

    sendSuccess(res, "Product deleted successfully");
  }
);

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Admin
export const uploadProductImages = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (!req.files || !Array.isArray(req.files)) {
      throw new AppError("No files uploaded", 400);
    }

    const files = req.files as Express.Multer.File[];

    // Convert buffer to base64 for Cloudinary upload
    const uploadPromises = files.map(async (file) => {
      const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;
      return uploadImage(base64);
    });

    const uploadedImages = await Promise.all(uploadPromises);

    // Add new images to product
    product.images.push(...uploadedImages);
    await product.save();

    sendSuccess(res, "Images uploaded successfully", product);
  }
);

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Admin
export const deleteProductImage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id, imageId } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const imagePublicId = Array.isArray(imageId) ? imageId[0] : imageId;

    const imageIndex = product.images.findIndex(
      (img) => img.publicId === imagePublicId
    );

    if (imageIndex === -1) {
      throw new AppError("Image not found", 404);
    }

    // Delete from Cloudinary
    await deleteImage(imagePublicId);

    // Remove from product
    product.images.splice(imageIndex, 1);
    await product.save();

    sendSuccess(res, "Image deleted successfully", product);
  }
);

// @desc    Toggle featured status
// @route   PATCH /api/products/:id/featured
// @access  Admin
export const toggleFeatured = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    sendSuccess(res, "Featured status updated", product);
  }
);
