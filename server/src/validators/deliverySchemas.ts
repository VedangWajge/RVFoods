import { z } from "zod";
import { deliveryLocationSchema, orderProductItemSchema } from "./orderSchemas.js";

export const deliveryQuoteSchema = z.object({
  location: deliveryLocationSchema,
  items: z.array(orderProductItemSchema).min(1, "Order must contain at least one product"),
  promoCode: z.string().optional(),
});
