import { afterEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { Order } from "../src/models/Order.js";
import { Product } from "../src/models/Product.js";
import { updateOrderStatus } from "../src/controllers/orderController.js";
import {
  createProduct,
  getProducts,
  updateProduct,
} from "../src/controllers/productController.js";
import { priceOrderItems } from "../src/utils/orderPricing.js";
import {
  createProductSchema,
  updateProductSchema,
  withVariantSummary,
} from "../src/validators/productSchemas.js";

const PRODUCT_ID = "64b000000000000000000001";

const run = (handler: unknown, req: unknown): Promise<any> =>
  new Promise((resolve, reject) => {
    const res = {
      status() {
        return this;
      },
      json: resolve,
    };
    (handler as (a: unknown, b: unknown, c: unknown) => void)(req, res, reject);
  });

const sizes = [
  { weight: "125g", price: 125, stock: 20 },
  { weight: "250g", price: 250, discountPrice: 200, stock: 5 },
  { weight: "1kg", price: 900, stock: 0 },
];

const mockProductWithSizes = () =>
  mock.method(Product, "find", () =>
    Promise.resolve([
      {
        _id: { toString: () => PRODUCT_ID },
        name: "Besan Ladoo",
        price: 125,
        images: [],
        variants: sizes,
      },
    ])
  );

afterEach(() => mock.restoreAll());

test("the product summary comes from its sizes", () => {
  const summary = withVariantSummary({ variants: sizes });
  assert.equal(summary.price, 125);
  assert.equal(summary.weight, "125g");
  assert.equal(summary.stock, 25);
  assert.equal(summary.discountPrice, null);
});

test("the cheapest size is judged by what customers actually pay", () => {
  const summary = withVariantSummary({
    variants: [
      { weight: "A", price: 100, stock: 1 },
      { weight: "B", price: 150, discountPrice: 80, stock: 1 },
    ],
  });
  assert.equal(summary.price, 150);
  assert.equal(summary.discountPrice, 80);
  assert.equal(summary.weight, "B");
});

test("a blank discount on a size isn't saved", () => {
  const summary = withVariantSummary({
    variants: [{ weight: "A", price: 100, discountPrice: null, stock: 1 }],
  });
  assert.equal("discountPrice" in summary.variants![0], false);
});

test("a product without sizes is left alone", () => {
  assert.deepEqual(withVariantSummary({ price: 30, stock: 5 }), { price: 30, stock: 5 });
});

test("sizes must be unique and discounts below the price", () => {
  assert.equal(
    updateProductSchema.safeParse({
      variants: [
        { weight: "250g", price: 100, stock: 1 },
        { weight: "250G", price: 200, stock: 1 },
      ],
    }).success,
    false
  );
  assert.equal(
    updateProductSchema.safeParse({
      variants: [{ weight: "250g", price: 100, discountPrice: 100, stock: 1 }],
    }).success,
    false
  );
});

test("a new product needs a price or sizes, but no description", () => {
  const base = { name: "Festive Box", category: "sweets" };
  assert.equal(createProductSchema.safeParse(base).success, false);
  assert.equal(createProductSchema.safeParse({ ...base, price: 100 }).success, true);
  assert.equal(
    createProductSchema.safeParse({ ...base, variants: [{ weight: "1kg", price: 100 }] }).success,
    true
  );
  assert.equal(updateProductSchema.safeParse({ description: "" }).success, true);
});

test("creating a product with sizes saves the summary", async () => {
  const create = mock.method(Product, "create", (data: unknown) => Promise.resolve(data));

  await run(createProduct, {
    body: { name: "Festive Box", category: "sweets", variants: sizes },
  });

  const saved = create.mock.calls[0].arguments[0] as any;
  assert.equal(saved.price, 125);
  assert.equal(saved.stock, 25);
  assert.equal(saved.variants.length, 3);
  // A null discount must never be stored: the shop would treat it as a discount.
  assert.equal("discountPrice" in saved, false);
});

test("clearing the discount removes it from the product", async () => {
  const update = mock.method(Product, "findByIdAndUpdate", () =>
    Promise.resolve({ _id: "1" })
  );

  await run(updateProduct, {
    params: { id: "1" },
    body: { price: 500, discountPrice: null },
  });

  const change = update.mock.calls[0].arguments[1] as any;
  assert.deepEqual(change.$unset, { discountPrice: 1 });
  assert.deepEqual(change.$set, { price: 500 });
});

test("a discount can still be set, and editing nothing leaves it alone", async () => {
  const update = mock.method(Product, "findByIdAndUpdate", () =>
    Promise.resolve({ _id: "1" })
  );

  await run(updateProduct, { params: { id: "1" }, body: { price: 500, discountPrice: 400 } });
  assert.deepEqual((update.mock.calls[0].arguments[1] as any).$set, {
    price: 500,
    discountPrice: 400,
  });

  await run(updateProduct, { params: { id: "1" }, body: { stock: 3 } });
  const second = update.mock.calls[1].arguments[1] as any;
  assert.deepEqual(second.$set, { stock: 3 });
  assert.equal("$unset" in second, false);
});

test("removing all sizes makes it a single-size product again", async () => {
  const update = mock.method(Product, "findByIdAndUpdate", () =>
    Promise.resolve({ _id: "1" })
  );

  await run(updateProduct, {
    params: { id: "1" },
    body: { variants: [], price: 30, stock: 5, weight: "1 piece", discountPrice: null },
  });

  const change = update.mock.calls[0].arguments[1] as any;
  assert.deepEqual(change.$set.variants, []);
  assert.equal(change.$set.price, 30);
  assert.deepEqual(change.$unset, { discountPrice: 1 });
});

test("the order uses the chosen size's price and records the size", async () => {
  mockProductWithSizes();

  const priced = await priceOrderItems([
    { productId: PRODUCT_ID, quantity: 2, weight: "125g" },
    { productId: PRODUCT_ID, quantity: 1, weight: "250g" },
  ]);

  assert.equal(priced.subtotal, 125 * 2 + 200);
  assert.deepEqual(
    priced.orderProducts.map((p) => [p.name, p.price, p.quantity]),
    [
      ["Besan Ladoo (125g)", 125, 2],
      ["Besan Ladoo (250g)", 200, 1],
    ]
  );
});

test("a price sent by the browser can't change the order", async () => {
  mockProductWithSizes();
  const priced = await priceOrderItems([
    { productId: PRODUCT_ID, quantity: 1, weight: "1kg", price: 1 } as never,
  ]);
  assert.equal(priced.subtotal, 900);
});

test("an order must name a size that exists", async () => {
  mockProductWithSizes();

  await assert.rejects(priceOrderItems([{ productId: PRODUCT_ID, quantity: 1 }]), {
    statusCode: 400,
    message: /choose a size/,
  });
  await assert.rejects(
    priceOrderItems([{ productId: PRODUCT_ID, quantity: 1, weight: "5kg" }]),
    { statusCode: 400, message: /no longer sold in 5kg/ }
  );
});

test("single-size products still price as before", async () => {
  mock.method(Product, "find", () =>
    Promise.resolve([
      { _id: { toString: () => PRODUCT_ID }, name: "Karanji", price: 35, images: [] },
    ])
  );

  const priced = await priceOrderItems([{ productId: PRODUCT_ID, quantity: 3 }]);

  assert.equal(priced.subtotal, 105);
  assert.equal(priced.orderProducts[0].name, "Karanji");
});

const listFilter = async (query: object, user?: object) => {
  const aggregate = mock.method(Product, "aggregate", () => Promise.resolve([]));
  mock.method(Product, "countDocuments", () => Promise.resolve(0));
  await run(getProducts, { query, user });
  return (aggregate.mock.calls.at(-1)!.arguments[0] as any[])[0].$match;
};

test("an admin can list hidden products", async () => {
  assert.deepEqual(await listFilter({ includeHidden: "true" }, { role: "admin" }), {});
});

test("nobody else can list hidden products", async () => {
  assert.deepEqual(await listFilter({ includeHidden: "true" }), { isActive: true });
  mock.restoreAll();
  assert.deepEqual(await listFilter({ includeHidden: "true" }, { role: "customer" }), {
    isActive: true,
  });
  mock.restoreAll();
  assert.deepEqual(await listFilter({}, { role: "admin" }), { isActive: true });
});

const cancelOrder = async (paymentMethod: string) => {
  const order = {
    orderStatus: "placed",
    paymentMethod,
    paymentStatus: "pending",
    products: [{ productId: PRODUCT_ID, quantity: 2 }],
    save: () => Promise.resolve(),
  };
  mock.method(Order, "findOne", () => Promise.resolve(order));
  const restock = mock.method(Product, "findByIdAndUpdate", () => Promise.resolve({}));
  await run(updateOrderStatus, { params: { id: "RVF-1" }, body: { status: "cancelled" } });
  assert.equal(order.orderStatus, "cancelled");
  return restock.mock.callCount();
};

test("cancelling a WhatsApp order doesn't add stock it never took", async () => {
  assert.equal(await cancelOrder("whatsapp"), 0);
});

test("cancelling other orders still returns stock", async () => {
  assert.equal(await cancelOrder("cod"), 1);
});
