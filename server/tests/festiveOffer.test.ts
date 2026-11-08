import { afterEach, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { Order } from "../src/models/Order.js";
import { Product } from "../src/models/Product.js";
import { StoreSettings } from "../src/models/StoreSettings.js";
import { confirmWhatsAppOrder } from "../src/controllers/orderController.js";
import { getPublicOffer, updateAdminOffer } from "../src/controllers/offerController.js";
import { priceOrderItems } from "../src/utils/orderPricing.js";

const PRODUCT_ID = "64b000000000000000000001";
const items = [{ productId: PRODUCT_ID, quantity: 2 }];

const run = (
  handler: (req: never, res: never, next: never) => void,
  body: unknown = {}
): Promise<{ statusCode?: number; body?: any; error?: any }> =>
  new Promise((resolve) => {
    const res = {
      statusCode: 200,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        resolve({ statusCode: this.statusCode, body: payload });
        return this;
      },
    };
    handler({ body } as never, res as never, ((error: unknown) =>
      resolve({ error })) as never);
  });

const diwali = (changes: object = {}) => ({
  festiveOffer: {
    bannerEnabled: true,
    discountEnabled: true,
    title: "Diwali Offer",
    discountPercent: 50,
    maxOrders: 10,
    countFrom: new Date("2026-11-01"),
    ...changes,
  },
});

/** Sets the saved offer and how many confirmed orders have used it. */
const useOffer = (settings: object | null, claimed: number) => {
  mock.method(StoreSettings, "findOne", () => Promise.resolve(settings));
  return mock.method(Order, "countDocuments", () => Promise.resolve(claimed));
};

beforeEach(() => {
  mock.method(Product, "find", () =>
    Promise.resolve([
      { _id: { toString: () => PRODUCT_ID }, name: "Chakli", price: 500, images: [] },
    ])
  );
});

afterEach(() => mock.restoreAll());

test("with places left, the order gets half off", async () => {
  useOffer(diwali(), 3);

  const priced = await priceOrderItems(items);

  assert.equal(priced.subtotal, 1000);
  assert.equal(priced.discount, 500);
  assert.equal(priced.offerDiscount, 500);
  assert.equal(priced.offerTitle, "Diwali Offer");
});

test("after the tenth confirmed order, there's no discount", async () => {
  useOffer(diwali(), 10);

  const priced = await priceOrderItems(items);

  assert.equal(priced.discount, 0);
  assert.equal(priced.offerDiscount, 0);
});

test("only confirmed orders since the last reset are counted", async () => {
  const count = useOffer(diwali(), 0);

  await priceOrderItems(items);

  const [filter] = count.mock.calls[0].arguments as [any];
  assert.deepEqual(filter.offerDiscount, { $gt: 0 });
  assert.deepEqual(filter.orderStatus, { $nin: ["whatsapp_pending", "cancelled"] });
  assert.deepEqual(filter.createdAt, { $gte: new Date("2026-11-01") });
});

test("showing the banner alone doesn't give a discount", async () => {
  useOffer(diwali({ discountEnabled: false }), 0);

  const priced = await priceOrderItems(items);

  assert.equal(priced.discount, 0);
});

test("with no offer saved, nothing changes", async () => {
  useOffer(null, 0);

  const priced = await priceOrderItems(items, "RVFOODS10");

  assert.equal(priced.discount, 100);
  assert.equal(priced.offerDiscount, 0);
});

test("the offer and a promo code don't add up: the bigger one applies", async () => {
  useOffer(diwali(), 0);
  const withOffer = await priceOrderItems(items, "RVFOODS10");
  assert.equal(withOffer.discount, 500);
  assert.equal(withOffer.offerDiscount, 500);

  mock.restoreAll();
  mock.method(Product, "find", () =>
    Promise.resolve([
      { _id: { toString: () => PRODUCT_ID }, name: "Chakli", price: 500, images: [] },
    ])
  );
  useOffer(diwali({ discountPercent: 5 }), 0);
  const withPromo = await priceOrderItems(items, "RVFOODS10");
  assert.equal(withPromo.discount, 100);
  assert.equal(withPromo.offerDiscount, 0);
});

const offerDraft = () =>
  new Order({
    orderId: "RVF-ABC123",
    products: [{ productId: PRODUCT_ID, name: "Chakli", price: 500, quantity: 2 }],
    totalAmount: 1000,
    discount: 500,
    offerDiscount: 500,
    deliveryCharge: 70,
    finalAmount: 570,
    paymentMethod: "whatsapp",
    orderStatus: "whatsapp_pending",
    shippingAddress: { street: "Flat 4", city: "Mumbai", state: "Maharashtra", country: "India" },
  });

test("confirming keeps the discount while a place is left", async () => {
  useOffer(diwali(), 9);
  const order = offerDraft();
  mock.method(Order, "findOne", () => Promise.resolve(order));
  mock.method(Order.prototype, "save", function (this: unknown) {
    return Promise.resolve(this);
  });

  const { body } = await run(confirmWhatsAppOrder, { orderId: "RVF-ABC123" });

  assert.equal(order.orderStatus, "placed");
  assert.equal(body.data.finalAmount, 570);
  assert.equal(body.data.offerEnded, undefined);
});

test("if others used the last place first, the order is confirmed at full price", async () => {
  useOffer(diwali(), 10);
  const order = offerDraft();
  mock.method(Order, "findOne", () => Promise.resolve(order));
  mock.method(Order.prototype, "save", function (this: unknown) {
    return Promise.resolve(this);
  });

  const { body } = await run(confirmWhatsAppOrder, { orderId: "RVF-ABC123" });

  assert.equal(order.orderStatus, "placed");
  assert.equal(order.discount, 0);
  assert.equal(order.offerDiscount, 0);
  assert.equal(body.data.finalAmount, 1070);
  assert.equal(body.data.offerEnded, true);
  assert.match(body.message, /offer has just ended.*₹1070/);
});

test("if the discount was switched off, the draft loses it on confirming", async () => {
  useOffer(diwali({ discountEnabled: false }), 0);
  const order = offerDraft();
  mock.method(Order, "findOne", () => Promise.resolve(order));
  mock.method(Order.prototype, "save", function (this: unknown) {
    return Promise.resolve(this);
  });

  const { body } = await run(confirmWhatsAppOrder, { orderId: "RVF-ABC123" });

  assert.equal(body.data.finalAmount, 1070);
});

test("customers see places left but not the order count", async () => {
  useOffer(diwali(), 4);

  const { body } = await run(getPublicOffer);

  assert.deepEqual(body.data, {
    bannerEnabled: true,
    title: "Diwali Offer",
    discountPercent: 50,
    maxOrders: 10,
    remaining: 6,
    active: true,
  });
});

test("the admin can switch the discount off and reset the count", async () => {
  useOffer(diwali(), 0);
  const update = mock.method(StoreSettings, "findOneAndUpdate", () => Promise.resolve({}));

  const { statusCode } = await run(updateAdminOffer, {
    discountEnabled: false,
    resetCount: true,
  });

  assert.equal(statusCode, 200);
  const [filter, change] = update.mock.calls[0].arguments as [any, any];
  assert.deepEqual(filter, { key: "store" });
  assert.equal(change.$set["festiveOffer.discountEnabled"], false);
  assert.ok(change.$set["festiveOffer.countFrom"] instanceof Date);
  assert.equal(change.$set["festiveOffer.bannerEnabled"], undefined);
});

test("a discount over 90% is refused", async () => {
  const { error } = await run(updateAdminOffer, { discountPercent: 95 });
  assert.ok(error);
});
