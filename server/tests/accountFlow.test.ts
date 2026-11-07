import { afterEach, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { User } from "../src/models/User.js";
import { Order } from "../src/models/Order.js";
import { Product } from "../src/models/Product.js";
import { login, register, resendOtp } from "../src/controllers/authController.js";
import { createWhatsAppOrderAttempt } from "../src/controllers/orderController.js";
import { getRefreshCookieOptions } from "../src/utils/generateToken.js";
import { whatsappOrderAttemptSchema } from "../src/validators/orderSchemas.js";

const PRODUCT_ID = "64b000000000000000000001";

const run = (handler: unknown, req: object): Promise<any> =>
  new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(body: unknown) {
        resolve({ statusCode: this.statusCode, body });
        return this;
      },
      cookie() {},
    };
    (handler as (a: unknown, b: unknown, c: unknown) => void)(req, res, reject);
  });

const lookup = (found: unknown) =>
  mock.method(User, "findOne", () => {
    const query = Promise.resolve(found) as any;
    query.select = () => Promise.resolve(found);
    return query;
  });

beforeEach(() => {
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
  process.env.GOOGLE_MAPS_SERVER_KEY = "test-key";
});

afterEach(() => mock.restoreAll());

test("in production the session cookie works across the site and API addresses", () => {
  const options = getRefreshCookieOptions("production");
  assert.equal(options.sameSite, "none");
  assert.equal(options.secure, true, "browsers reject SameSite=None without Secure");
  assert.equal(options.httpOnly, true);
});

test("on your own computer the cookie still works over plain http", () => {
  const options = getRefreshCookieOptions("development");
  assert.equal(options.sameSite, "lax");
  assert.equal(options.secure, false);
});

test("logging in with an unknown email gets a code that sends them to register", async () => {
  lookup(null);

  const { statusCode, body } = await run(login, {
    body: { email: "New@Example.com", password: "Secret123" },
  });

  assert.equal(statusCode, 404);
  assert.equal(body.error, "ACCOUNT_NOT_FOUND");
});

test("a wrong password isn't treated as a new customer", async () => {
  lookup({ password: "hash", comparePassword: () => Promise.resolve(false) });

  const { statusCode, body } = await run(login, {
    body: { email: "a@example.com", password: "Wrong1234" },
  });

  assert.equal(statusCode, 401);
  assert.equal(body.error, undefined);
});

test("a Google-only account is told to use Google", async () => {
  lookup({ googleId: "g-1" });

  const { statusCode, body } = await run(login, {
    body: { email: "a@example.com", password: "Secret123" },
  });

  assert.equal(statusCode, 401);
  assert.match(body.message, /Google/);
});

const emailAccount = () => ({
  _id: { toString: () => "64b0000000000000000000a1" },
  name: "Asha",
  email: "asha@example.com",
  isVerified: false,
});

test("registering never returns the OTP, even when email can't be sent", async () => {
  delete process.env.RESEND_API_KEY;
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  lookup(null);
  mock.method(User, "create", () => Promise.resolve(emailAccount()));
  mock.method(User, "updateOne", () => Promise.resolve({}));
  mock.method(User, "findById", () => Promise.resolve(emailAccount()));
  const logged: string[] = [];
  mock.method(console, "log", (...args: unknown[]) => logged.push(args.join(" ")));

  const { statusCode, body } = await run(register, {
    body: { name: "Asha", email: "asha@example.com", password: "Secret123" },
  });
  process.env.NODE_ENV = previousEnv;

  assert.equal(statusCode, 422);
  assert.match(body.message, /couldn't send/);
  assert.doesNotMatch(JSON.stringify(body), /devOtp|\b\d{6}\b/);
  assert.equal(logged.filter((line) => /OTP/i.test(line)).length, 0);
});

test("resending never returns the OTP either", async () => {
  delete process.env.RESEND_API_KEY;
  lookup({ ...emailAccount() });
  mock.method(User, "updateOne", () => Promise.resolve({}));

  const { statusCode, body } = await run(resendOtp, { body: { email: "asha@example.com" } });

  assert.equal(statusCode, 422);
  assert.doesNotMatch(JSON.stringify(body), /devOtp|\b\d{6}\b/);
});

const addressOnly = {
  items: [{ productId: PRODUCT_ID, quantity: 1 }],
  formattedAddress: "LBS Road, Mulund West, Mumbai",
  location: { lat: 19.19, lng: 72.97 },
  expectedDeliveryCharge: 0,
};

const placeOrder = async (body: object, user?: object) => {
  mock.method(Product, "find", () =>
    Promise.resolve([{ _id: { toString: () => PRODUCT_ID }, name: "Chakli", price: 5000, images: [] }])
  );
  mock.method(globalThis, "fetch", () =>
    Promise.resolve(new Response(JSON.stringify({ routes: [{ distanceMeters: 5000 }] })))
  );
  const saved: any[] = [];
  mock.method(Order.prototype, "save", function (this: unknown) {
    saved.push(this);
    return Promise.resolve(this);
  });
  const result = await run(createWhatsAppOrderAttempt, { body, user });
  return { ...result, order: saved[0] };
};

test("an order needs only an address", async () => {
  const { statusCode, order } = await placeOrder(addressOnly);

  assert.equal(statusCode, 201);
  assert.equal(order.shippingAddress.street, "LBS Road, Mulund West, Mumbai");
  assert.equal(order.shippingAddress.pincode, "");
  assert.equal(order.customerName, undefined);
});

test("a signed-in customer's name comes from their profile", async () => {
  const { order } = await placeOrder(addressOnly, { _id: "u1", name: "Vedang W" });
  assert.equal(order.customerName, "Vedang W");
});

test("a name, flat and PIN are used when given", async () => {
  const { order } = await placeOrder(
    { ...addressOnly, customerName: "Asha", addressLine: "Flat 4", pincode: "400080" },
    { _id: "u1", name: "Vedang W" }
  );
  assert.equal(order.customerName, "Asha");
  assert.equal(order.shippingAddress.street, "Flat 4, LBS Road, Mulund West, Mumbai");
  assert.equal(order.shippingAddress.pincode, "400080");
});

test("the address is still required, and a mistyped PIN is refused", () => {
  const { formattedAddress: _a, ...noAddress } = addressOnly;
  const { location: _l, ...noPin } = addressOnly;
  assert.equal(whatsappOrderAttemptSchema.safeParse(noAddress).success, false);
  assert.equal(whatsappOrderAttemptSchema.safeParse(noPin).success, false);
  assert.equal(whatsappOrderAttemptSchema.safeParse({ ...addressOnly, pincode: "12" }).success, false);
  assert.equal(whatsappOrderAttemptSchema.safeParse(addressOnly).success, true);
});
