import type { Types } from "mongoose";
import { Product } from "../models/Product.js";
import { AppError } from "../middleware/errorHandler.js";

interface OrderItemInput {
  productId: string;
  quantity: number;
  weight?: string;
}

interface PricedOrderProduct {
  productId: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface PricedOrderItems {
  orderProducts: PricedOrderProduct[];
  subtotal: number;
  discount: number;
}

/** Prices a cart from MongoDB. Nothing about the price is taken from the browser. */
export const priceOrderItems = async (
  items: OrderItemInput[],
  promoCode?: string
): Promise<PricedOrderItems> => {
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  });

  const productMap = new Map<string, (typeof products)[0]>();
  for (const prod of products) {
    productMap.set(prod._id.toString(), prod);
  }

  const orderProducts: PricedOrderProduct[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new AppError(
        `Product with ID ${item.productId} is unavailable or inactive`,
        400
      );
    }

    if (item.quantity <= 0) {
      throw new AppError(`Invalid quantity for product ${product.name}`, 400);
    }

    // Products sold in several sizes are priced by the chosen size
    const hasSizes = (product.variants?.length ?? 0) > 0;
    const variant = hasSizes
      ? product.variants.find((v) => v.weight === item.weight)
      : undefined;

    if (hasSizes && !variant) {
      throw new AppError(
        item.weight
          ? `${product.name} is no longer sold in ${item.weight}. Please remove it from your cart and add it again.`
          : `Please choose a size for ${product.name}. Remove it from your cart and add it again.`,
        400
      );
    }

    // Trust only the server-side price from MongoDB
    const priced = variant ?? product;
    const unitPrice =
      typeof priced.discountPrice === "number" && priced.discountPrice > 0
        ? priced.discountPrice
        : priced.price;

    subtotal += unitPrice * item.quantity;

    orderProducts.push({
      productId: product._id,
      // The order keeps its own copy of the name, so it records the size too.
      name: variant ? `${product.name} (${variant.weight})` : product.name,
      image: product.images?.[0]?.url ?? "",
      price: unitPrice,
      quantity: item.quantity,
    });
  }

  // Server-side promo calculation
  let discount = 0;
  if (promoCode) {
    const normalizedPromo = promoCode.trim().toUpperCase();
    if (normalizedPromo === "RVFOODS10") {
      discount = Math.round(subtotal * 0.1);
    }
  }

  return { orderProducts, subtotal, discount: Math.min(discount, subtotal) };
};
