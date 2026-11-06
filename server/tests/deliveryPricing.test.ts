import { test } from "node:test";
import assert from "node:assert/strict";
import type { DeliveryRates } from "../src/config/delivery.js";
import {
  buildDeliveryQuote,
  calculateDeliveryCharge,
} from "../src/utils/deliveryPricing.js";

// Fixed rates, so editing the real config can't break these tests.
const rates: DeliveryRates = {
  BASE_FARE: 50,
  BASE_KM: 3,
  PER_KM_RATE: 10,
  MIN_CHARGE: 40,
  BUFFER_PERCENT: 10,
  ROUND_TO: 10,
  MAX_DISTANCE_KM: 20,
  FREE_DELIVERY_ABOVE: 2000,
  FALLBACK_FLAT_CHARGE: 150,
};

test("0 km charges the base fare with buffer", () => {
  assert.equal(calculateDeliveryCharge(0, rates), 60); // 50 * 1.1 = 55 -> 60
});

test("exactly BASE_KM has no per-km charge", () => {
  assert.equal(calculateDeliveryCharge(3, rates), 60);
});

test("just past BASE_KM starts the per-km charge", () => {
  assert.equal(calculateDeliveryCharge(3.5, rates), 70); // 55 * 1.1 = 60.5 -> 70
});

test("exactly MAX_DISTANCE_KM is still deliverable", () => {
  // 50 + 17 * 10 = 220, * 1.1 = 242 -> 250
  assert.equal(calculateDeliveryCharge(20, rates), 250);
  assert.deepEqual(buildDeliveryQuote(20, 500, rates), {
    status: "calculated",
    deliveryCharge: 250,
    distanceKm: 20,
  });
});

test("beyond MAX_DISTANCE_KM is out of range", () => {
  assert.deepEqual(buildDeliveryQuote(20.01, 500, rates), {
    status: "out_of_range",
    deliveryCharge: null,
    distanceKm: 20.01,
  });
});

test("minimum charge applies when the fare is lower, and is buffered", () => {
  const cheap = { ...rates, BASE_FARE: 10, MIN_CHARGE: 100 };
  assert.equal(calculateDeliveryCharge(0, cheap), 110);
});

test("rounds up to ROUND_TO", () => {
  const noBuffer = { ...rates, BUFFER_PERCENT: 0 };
  assert.equal(calculateDeliveryCharge(3.1, noBuffer), 60); // 51 -> 60
  assert.equal(calculateDeliveryCharge(4, noBuffer), 60); // exactly 60 stays 60
  assert.equal(calculateDeliveryCharge(4, { ...noBuffer, ROUND_TO: 25 }), 75);
});

test("float noise doesn't add an extra rounding step", () => {
  // 100 * 1.1 is 110.00000000000001 in floating point; the charge must stay 110.
  const flat = { ...rates, BASE_FARE: 100, MIN_CHARGE: 100 };
  assert.equal(calculateDeliveryCharge(0, flat), 110);
});

test("rejects invalid distances", () => {
  assert.throws(() => calculateDeliveryCharge(-1, rates), RangeError);
  assert.throws(() => calculateDeliveryCharge(Number.NaN, rates), RangeError);
});

test("free delivery starts exactly at the threshold", () => {
  assert.equal(buildDeliveryQuote(5, 1999, rates).status, "calculated");
  assert.deepEqual(buildDeliveryQuote(5, 2000, rates), {
    status: "free",
    deliveryCharge: 0,
    distanceKm: 5,
  });
});

test("free delivery can be turned off", () => {
  const off = { ...rates, FREE_DELIVERY_ABOVE: null };
  assert.equal(buildDeliveryQuote(5, 99999, off).status, "calculated");
});

test("free delivery doesn't override the distance limit", () => {
  assert.equal(buildDeliveryQuote(50, 5000, rates).status, "out_of_range");
});

test("API down uses the fallback flat charge", () => {
  assert.deepEqual(buildDeliveryQuote(null, 500, rates), {
    status: "fallback",
    deliveryCharge: 150,
    distanceKm: null,
  });
});

test("API down still gives free delivery above the threshold", () => {
  assert.equal(buildDeliveryQuote(null, 2500, rates).deliveryCharge, 0);
});
