import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "razorpay" | "cod";
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface IOrderProductItem {
  productId: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IOrder extends Document {
  orderId: string;
  userId: Types.ObjectId;
  products: IOrderProductItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: OrderStatus;
  shippingAddress: IShippingAddress;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderProductSchema = new Schema<IOrderProductItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "India" },
  },
  { _id: false }
);

function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RVF-${suffix}`;
}

const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      unique: true,
      uppercase: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    products: {
      type: [orderProductSchema],
      validate: {
        validator: (v: IOrderProductItem[]) => Array.isArray(v) && v.length > 0,
        message: "Order must contain at least one product",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      required: true,
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    orderStatus: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    estimatedDelivery: { type: Date },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

orderSchema.pre("validate", async function (next) {
  if (this.orderId) return next();

  const OrderModel = this.constructor as Model<IOrder>;
  let orderId = generateOrderId();
  let attempts = 0;

  while ((await OrderModel.exists({ orderId })) && attempts < 10) {
    orderId = generateOrderId();
    attempts += 1;
  }

  this.orderId = orderId;
  next();
});

export const Order: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>("Order", orderSchema);
