import { afterEach, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { Order } from "../src/models/Order.js";
import { Product } from "../src/models/Product.js";
import { DELIVERY_CONFIG } from "../src/config/delivery.js";
import {
  confirmWhatsAppOrder,
  createWhatsAppOrderAttempt,
} from "../src/controllers/orderController.js";
import { getDeliveryQuote } from "../src/controllers/deliveryController.js";
import { getRoadDistanceKm } from "../src/utils/deliveryDistance.js";
import { calculateDeliveryCharge } from "../src/utils/deliveryPricing.js";

const PRODUCT_ID = "64b000000000000000000001";
const location = { lat: 19.19, lng: 72.97 };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const routeOf = (km: number) => () =>
  Promise.resolve(jsonResponse({ routes: [{ distanceMeters: km * 1000 }] }));

/** Runs a handler the way Express would and reports its response or error. */
const run = (
  handler: (req: never, res: never, next: never) => void,
  body: unknown
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

const orderBody = (km: number) => ({
  items: [{ productId: PRODUCT_ID, quantity: 1 }],
  customerName: "Asha Patil",
  addressLine: "Flat 4, Sai Niwas",
  formattedAddress: "LBS Road, Mulund West, Mumbai",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400080",
  location,
  expectedDeliveryCharge: calculateDeliveryCharge(km),
});

let saved: any[] = [];

beforeEach(() => {
  process.env.GOOGLE_MAPS_SERVER_KEY = "test-key";
  saved = [];

  mock.method(Product, "find", () =>
    Promise.resolve([
      { _id: { toString: () => PRODUCT_ID }, name: "Chakli", price: 500, images: [] },
    ])
  );
  mock.method(Order.prototype, "save", function (this: unknown) {
    saved.push(this);
    return Promise.resolve(this);
  });
});

afterEach(() => mock.restoreAll());

test("order total uses the server's charge and stores the address and pin", async () => {
  mock.method(globalThis, "fetch", routeOf(5));
  const expected = calculateDeliveryCharge(5);

  const { statusCode, body } = await run(createWhatsAppOrderAttempt, orderBody(5));

  assert.equal(statusCode, 201);
  assert.equal(body.data.deliveryCharge, expected);
  assert.equal(body.data.finalAmount, 500 + expected);

  const [order] = saved;
  assert.equal(order.customerName, "Asha Patil");
  assert.equal(order.deliveryCharge, expected);
  assert.equal(order.deliveryDistanceKm, 5);
  assert.equal(order.deliveryChargeSource, "calculated");
  assert.equal(order.deliveryLocation.lat, location.lat);
  assert.equal(order.deliveryLocation.lng, location.lng);
  assert.equal(
    order.shippingAddress.street,
    "Flat 4, Sai Niwas, LBS Road, Mulund West, Mumbai"
  );
  assert.equal(order.shippingAddress.pincode, "400080");
});

test("a lower charge sent by the browser is refused, not used", async () => {
  mock.method(globalThis, "fetch", routeOf(10));

  const { error } = await run(createWhatsAppOrderAttempt, {
    ...orderBody(10),
    expectedDeliveryCharge: 1,
  });

  assert.equal(error.statusCode, 409);
  assert.equal(saved.length, 0);
});

test("the charge comes from the pin the server is sent", async () => {
  const fetchMock = mock.method(globalThis, "fetch", routeOf(5));

  await run(createWhatsAppOrderAttempt, orderBody(5));

  const request = JSON.parse(String(fetchMock.mock.calls[0].arguments[1]?.body));
  assert.deepEqual(request.destination.location.latLng, {
    latitude: location.lat,
    longitude: location.lng,
  });
});

test("orders beyond the max distance are refused", async () => {
  mock.method(globalThis, "fetch", routeOf(DELIVERY_CONFIG.MAX_DISTANCE_KM + 1));

  const { error } = await run(createWhatsAppOrderAttempt, orderBody(1));

  assert.equal(error.statusCode, 422);
  assert.match(error.message, /message us/i);
  assert.equal(saved.length, 0);
});

test("API down charges the fallback and records that it did", async () => {
  mock.method(globalThis, "fetch", () => Promise.reject(new Error("network down")));

  const { statusCode } = await run(createWhatsAppOrderAttempt, {
    ...orderBody(1),
    expectedDeliveryCharge: DELIVERY_CONFIG.FALLBACK_FLAT_CHARGE,
  });

  assert.equal(statusCode, 201);
  assert.equal(saved[0].deliveryChargeSource, "fallback");
  assert.equal(saved[0].deliveryCharge, DELIVERY_CONFIG.FALLBACK_FLAT_CHARGE);
  assert.equal(saved[0].deliveryDistanceKm, undefined);
});

test("orders without a valid PIN code or an Indian pin are refused", async () => {
  mock.method(globalThis, "fetch", routeOf(5));

  const noPincode = await run(createWhatsAppOrderAttempt, { ...orderBody(5), pincode: "12" });
  assert.match(noPincode.error.errors[0].message, /PIN/);

  const abroad = await run(createWhatsAppOrderAttempt, {
    ...orderBody(5),
    location: { lat: 51.5, lng: -0.12 },
  });
  assert.match(abroad.error.errors[0].message, /India/);
  assert.equal(saved.length, 0);
});

test("quote returns the charge and total", async () => {
  mock.method(globalThis, "fetch", routeOf(5));
  const expected = calculateDeliveryCharge(5);

  const { body } = await run(getDeliveryQuote, {
    location,
    items: [{ productId: PRODUCT_ID, quantity: 2 }],
    promoCode: "rvfoods10",
  });

  assert.equal(body.data.status, "calculated");
  assert.equal(body.data.subtotal, 1000);
  assert.equal(body.data.discount, 100);
  assert.equal(body.data.deliveryCharge, expected);
  assert.equal(body.data.finalAmount, 900 + expected);
});

test("quote beyond the max distance has no charge or total", async () => {
  mock.method(globalThis, "fetch", routeOf(DELIVERY_CONFIG.MAX_DISTANCE_KM + 1));

  const { body } = await run(getDeliveryQuote, {
    location,
    items: [{ productId: PRODUCT_ID, quantity: 1 }],
  });

  assert.equal(body.data.status, "out_of_range");
  assert.equal(body.data.deliveryCharge, null);
  assert.equal(body.data.finalAmount, null);
});

test("the public confirm route doesn't return the customer's details", async () => {
  const order: any = new Order({
    orderId: "RVF-ABC123",
    customerName: "Asha Patil",
    products: [],
    totalAmount: 500,
    finalAmount: 570,
    paymentMethod: "whatsapp",
    orderStatus: "whatsapp_pending",
    deliveryLocation: location,
    shippingAddress: {
      street: "Flat 4",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400080",
      country: "India",
    },
  });
  mock.method(Order, "findOne", () => Promise.resolve(order));

  const { body } = await run(confirmWhatsAppOrder, { orderId: "RVF-ABC123" });

  assert.deepEqual(Object.keys(body.data).sort(), [
    "finalAmount",
    "orderId",
    "orderStatus",
  ]);
  assert.doesNotMatch(JSON.stringify(body), /Asha|Flat 4|19\.19/);
});

test("route lookup asks Google for only the distance, 2-wheeler, from the shop", async () => {
  const fetchMock = mock.method(globalThis, "fetch", routeOf(7.256));

  assert.equal(await getRoadDistanceKm(location), 7.26);

  const [url, init] = fetchMock.mock.calls[0].arguments as [string, RequestInit];
  const headers = init.headers as Record<string, string>;
  const request = JSON.parse(String(init.body));
  const { lat, lng } = DELIVERY_CONFIG.SHOP_LAT_LNG;

  assert.equal(url, "https://routes.googleapis.com/directions/v2:computeRoutes");
  assert.equal(headers["X-Goog-Api-Key"], "test-key");
  assert.equal(headers["X-Goog-FieldMask"], "routes.distanceMeters");
  assert.equal(request.travelMode, "TWO_WHEELER");
  assert.deepEqual(request.origin.location.latLng, { latitude: lat, longitude: lng });
});

test("a route with no distance field means 0 km", async () => {
  mock.method(globalThis, "fetch", () =>
    Promise.resolve(jsonResponse({ routes: [{}] }))
  );
  assert.equal(await getRoadDistanceKm(location), 0);
});

test("route lookup separates 'no route' from 'API down'", async () => {
  mock.method(globalThis, "fetch", () => Promise.resolve(jsonResponse({})));
  await assert.rejects(getRoadDistanceKm(location), { statusCode: 422 });
  mock.restoreAll();

  for (const status of [400, 403, 429, 500]) {
    mock.method(globalThis, "fetch", () => Promise.resolve(jsonResponse({}, status)));
    assert.equal(await getRoadDistanceKm(location), null);
    mock.restoreAll();
  }
});

test("a missing API key counts as API down, not a crash", async () => {
  delete process.env.GOOGLE_MAPS_SERVER_KEY;
  assert.equal(await getRoadDistanceKm(location), null);
});
